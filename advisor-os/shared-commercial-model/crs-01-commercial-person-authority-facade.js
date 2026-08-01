import { createCanonicalDirectoryService } from '../cartera/canonical-directory-service.js';
import { createCanonicalPortfolioService } from '../cartera/canonical-portfolio-service.js';
import { createCartera040RelationshipMemoryService } from '../cartera/cartera-040a-relationship-memory-service.js';

const PERSON_KIND = 'COMMERCIAL_PERSON';
const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;

const CAPABILITIES = Object.freeze({
    exactPersonRead: true,
    personSearch: true,
    canonicalPortfolioRead: true,
    canonicalPolicyDetailRead: true,
    relationshipBriefRead: true,
    personAuthoritySnapshotRead: true,
});

const BOUNDARIES = Object.freeze({
    readOnly: true,
    statefulCache: false,
    personCreation: false,
    personMerge: false,
    identityResolutionExecution: false,
    relationshipMemoryMutation: false,
    policyMutation: false,
    opportunityMutation: false,
    quoteMutation: false,
    applicationMutation: false,
    crmMutation: false,
    automaticContact: false,
    automaticMessage: false,
    automaticTask: false,
    automaticCalendar: false,
});

function fail(code, cause = null) {
    const error = new Error(code);
    error.code = code;
    if (cause) error.cause = cause;
    return error;
}

function normalizeReference(value, code = 'CRS01_PERSON_REFERENCE_INVALID') {
    const reference = typeof value === 'string' ? value.trim() : '';
    if (!REFERENCE_PATTERN.test(reference)) throw fail(code);
    return reference;
}

function freeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
    Object.freeze(value);
    Object.values(value).forEach(freeze);
    return value;
}

function requireMethod(service, method, code) {
    if (!service || typeof service[method] !== 'function') throw fail(code);
}

function normalizeSearchQuery(value) {
    const query = typeof value === 'string' ? value.trim() : '';
    if (!query || query.length > 240) throw fail('CRS01_PERSON_SEARCH_QUERY_INVALID');
    return query;
}

function normalizeLimit(value, fallback = 50, maximum = 200) {
    if (value === undefined || value === null) return fallback;
    const normalized = Number(value);
    if (!Number.isInteger(normalized) || normalized < 1 || normalized > maximum) {
        throw fail('CRS01_LIMIT_INVALID');
    }
    return normalized;
}

export function createCommercialPersonAuthorityFacade({
    client,
    clock,
    directoryService,
    portfolioService,
    relationshipMemoryService,
} = {}) {
    const resolvedDirectory = directoryService || createCanonicalDirectoryService({ client, clock });
    const resolvedPortfolio = portfolioService || createCanonicalPortfolioService({ client });
    const resolvedRelationshipMemory = relationshipMemoryService
        || createCartera040RelationshipMemoryService({ client });

    requireMethod(resolvedDirectory, 'loadDirectory', 'CRS01_DIRECTORY_SERVICE_INVALID');
    requireMethod(resolvedDirectory, 'searchDirectory', 'CRS01_DIRECTORY_SEARCH_SERVICE_INVALID');
    requireMethod(resolvedPortfolio, 'loadPortfolio', 'CRS01_PORTFOLIO_SERVICE_INVALID');
    requireMethod(resolvedPortfolio, 'loadPolicyDetail', 'CRS01_POLICY_DETAIL_SERVICE_INVALID');
    requireMethod(
        resolvedRelationshipMemory,
        'loadRelationshipBrief',
        'CRS01_RELATIONSHIP_BRIEF_SERVICE_INVALID'
    );

    async function loadPerson(personReferenceInput) {
        const personReference = normalizeReference(personReferenceInput);
        const directory = await resolvedDirectory.loadDirectory();
        const entries = Array.isArray(directory?.entries) ? directory.entries : [];
        const person = entries.find(entry => (
            entry?.kind === PERSON_KIND && entry?.reference === personReference
        ));
        if (!person) throw fail('CRS01_PERSON_NOT_FOUND');
        return person;
    }

    async function searchPeople(queryInput, options = {}) {
        const query = normalizeSearchQuery(queryInput);
        const limit = normalizeLimit(options.limit);
        const results = await resolvedDirectory.searchDirectory(query, { limit });
        const people = (Array.isArray(results) ? results : [])
            .filter(result => result?.entry?.kind === PERSON_KIND)
            .map(result => freeze({
                entry: result.entry,
                matchReasons: Array.isArray(result.matchReasons)
                    ? [...result.matchReasons]
                    : [],
            }));
        return Object.freeze(people);
    }

    async function loadRelationshipBrief(personReferenceInput, options = {}) {
        const personReference = normalizeReference(personReferenceInput);
        const limit = normalizeLimit(options.limit, 60, 100);
        const brief = await resolvedRelationshipMemory.loadRelationshipBrief(
            personReference,
            { limit }
        );
        if (brief?.person?.personReference !== personReference) {
            throw fail('CRS01_RELATIONSHIP_BRIEF_PERSON_MISMATCH');
        }
        return brief;
    }

    async function loadPersonAuthoritySnapshot(personReferenceInput, options = {}) {
        const personReference = normalizeReference(personReferenceInput);
        const includePolicyDetails = options.includePolicyDetails === true;
        const historyLimit = normalizeLimit(options.historyLimit, 60, 100);
        const [person, relationshipBrief] = await Promise.all([
            loadPerson(personReference),
            loadRelationshipBrief(personReference, { limit: historyLimit }),
        ]);

        const policyReferences = Object.freeze([
            ...new Set(Array.isArray(person.policyReferences) ? person.policyReferences : []),
        ]);
        const policyDetails = includePolicyDetails
            ? Object.freeze(await Promise.all(
                policyReferences.map(reference => resolvedPortfolio.loadPolicyDetail(reference))
            ))
            : Object.freeze([]);

        return freeze({
            contractType: 'FORGE_COMMERCIAL_PERSON_AUTHORITY_SNAPSHOT',
            contractVersion: 'CRS-01-PERSON-AUTHORITY-SNAPSHOT-001.1',
            personReference,
            person,
            relationshipBrief,
            policyReferences,
            policyDetails,
            sourceAuthorities: {
                person: 'CARTERA_010B_COMMERCIAL_PERSON',
                directory: 'CARTERA_010D_UNIFIED_DIRECTORY',
                policies: 'CARTERA_010C_CANONICAL_PORTFOLIO',
                relationshipBrief: 'CARTERA_040B_PERSON_RELATIONSHIP_BRIEF',
            },
            boundaries: BOUNDARIES,
            readOnly: true,
        });
    }

    return Object.freeze({
        contractType: 'FORGE_COMMERCIAL_PERSON_AUTHORITY_FACADE',
        contractVersion: 'CRS-01-AUTHORITY-FACADE-001.1',
        capabilities: CAPABILITIES,
        boundaries: BOUNDARIES,
        loadPerson,
        searchPeople,
        loadPortfolio: (...args) => resolvedPortfolio.loadPortfolio(...args),
        loadPolicyDetail: policyReference => resolvedPortfolio.loadPolicyDetail(
            normalizeReference(policyReference, 'CRS01_POLICY_REFERENCE_INVALID')
        ),
        loadRelationshipBrief,
        loadPersonAuthoritySnapshot,
    });
}

export const CRS_01_COMMERCIAL_PERSON_AUTHORITY_CAPABILITIES = CAPABILITIES;
export const CRS_01_COMMERCIAL_PERSON_AUTHORITY_BOUNDARIES = BOUNDARIES;