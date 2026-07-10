(function(root,factory){var c=root.ForgeQuotePreviewPdfResultPersistenceContract,s=root.ForgeQuotePreviewPdfResultStore;if(typeof module==="object"&&module.exports){c=require("./quote-preview-pdf-result-persistence-contract.js");s=require("../../runtime/quote-preview/quote-preview-pdf-result-store.js");module.exports=factory(c,s);}else root.ForgeQuotePreviewPdfResultPersistenceCoordinator=factory(c,s);})(typeof globalThis!=="undefined"?globalThis:this,function(c,s){"use strict";
function bad(ok,code,msg){if(!ok){var e=new Error(msg);e.code=code;throw e;}}
function uuid(){return globalThis.crypto&&globalThis.crypto.randomUUID?globalThis.crypto.randomUUID():"preview-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);}
function create(o){o=o||{};var store=o.store||s.createStore(o.storeOptions),now=o.now||function(){return Date.now();},idFactory=o.idFactory||uuid,retention=Number(o.retentionMs);function persist(p,x){p=p||{};x=x||{};c.assertSafePayload(p);var created=x.createdAt?Date.parse(x.createdAt):now();bad(Number.isFinite(created),"CREATED_AT_INVALID","invalid createdAt");var ms=Number(x.retentionMs||retention),expires=x.expiresAt||p.expiresAt;bad(expires||(Number.isFinite(ms)&&ms>0),"RETENTION_POLICY_REQUIRED","retention required");expires=expires?new Date(expires).toISOString():new Date(created+ms).toISOString();return store.writePreviewResult({previewResultId:String(x.previewResultId||p.previewResultId||idFactory()),schemaVersion:c.SCHEMA_VERSION,createdAt:new Date(created).toISOString(),expiresAt:expires,fields:c.extractAuthorizedFields(p),ambiguity:p.ambiguity||(p.metadata&&p.metadata.ambiguity)||{},source:{extractorOwner:p.extractorOwner||null,adapterOwner:p.adapterOwner||null},quoteTruth:false,officialQuote:false});}function read(id){return store.readPreviewResult(c.normalizeIdentity(id));}function open(id,modal){bad(modal&&typeof modal.open==="function","CONFIRMATION_MODAL_API_REQUIRED","modal.open required");var r=read(id),payload=Object.assign({},r.fields,{ambiguity:r.ambiguity,previewResultIdentity:c.normalizeIdentity(id),persistenceMetadata:{createdAt:r.createdAt,expiresAt:r.expiresAt,schemaVersion:r.schemaVersion,quoteTruth:false}});modal.open(payload);return payload;}return Object.freeze({persistExtractionResult:persist,readForConfirmation:read,openConfirmationByIdentity:open,createExtractionReadyDetail:c.createExtractionReadyDetail});}
return Object.freeze({createCoordinator:create});
});

/* FORGE:107Z15E4R2_CANONICAL_BRIDGE_EXPORT_WRAPPER:START */
const {
  buildQuotePreviewPdfResultCanonicalPacket: __forge107z15e4r2BuildCanonicalPacket,
} = require("./quote-preview-pdf-result-canonical-bridge");

function buildQuotePreviewPdfCanonicalPersistenceInput(request = {}) {
  if (
    request === null
    || typeof request !== "object"
    || Array.isArray(request)
  ) {
    throw new TypeError("request must be a plain object");
  }

  return __forge107z15e4r2BuildCanonicalPacket(
    request.nativeResult ?? {},
    request.context ?? {},
  );
}

const __forge107z15e4r2PreviousExports = module.exports;
const __forge107z15e4r2NextExports = {
  ...__forge107z15e4r2PreviousExports,
  buildQuotePreviewPdfCanonicalPersistenceInput,
};

module.exports = Object.isFrozen(
  __forge107z15e4r2PreviousExports,
)
  ? Object.freeze(__forge107z15e4r2NextExports)
  : __forge107z15e4r2NextExports;
/* FORGE:107Z15E4R2_CANONICAL_BRIDGE_EXPORT_WRAPPER:END */
