# Nash Conversation Desk Composer Scope 001

**Status:** PRODUCT UX CONTRACT
**Surface:** Nash Conversation Desk
**First visible release:** Milestone 1

## Product behavior

The objection and conversation input must feel like a familiar WhatsApp message composer, not like a technical form.

The advisor can:

1. Type a message or objection.
2. Paste a message or full conversation.
3. Select the paperclip button.
4. Upload one conversation screenshot.
5. Drag and drop a screenshot on desktop.
6. Review the image thumbnail.
7. Remove or replace the attachment.
8. Select the related prospect when available.
9. Press **Analyze**.

## Layout

```text
┌─────────────────────────────────────────────────────────┐
│ Write or paste what the prospect said…                  │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ 📎  screenshot.png                          Analyze     │
└─────────────────────────────────────────────────────────┘
```

Mobile:

- Paperclip on the left.
- Expanding multiline field in the center.
- Analyze button on the right or immediately below when width is limited.
- Native Android file picker for the paperclip.
- Camera/gallery sources may appear through the native picker.
- No horizontal overflow.

Desktop:

- File picker through the paperclip.
- Drag-and-drop into the composer.
- Attachment thumbnail before analysis.

## Accepted first-release input

- Plain text.
- Pasted text.
- One image through `image/*`.
- PNG, JPEG, WebP, or any image format the browser can decode.
- One attachment at a time in Milestone 1.

## Interaction rules

- Enter creates a new line.
- Analysis begins only through the explicit **Analyze** action.
- Uploading an image does not begin analysis automatically.
- The user can remove the image before analysis.
- The original image remains private input and is not treated as Activity evidence.
- Extracted text must be shown for user correction.
- Unreadable text must be marked as unreadable.
- Cropped or missing conversation content must not be invented.
- Speaker identity must not be guessed silently.
- No WhatsApp message is sent from this composer.

## Output after analysis

- Situation or message purpose.
- Visible objection.
- Candidate underlying intent.
- Confidence and explanation.
- Missing context.
- Recommended strategy.
- What not to answer.
- Suggested question.
- Response ready to copy.

## Separation from delivery

The composer analyzes input. It does not send, schedule, update Pipeline, or confirm that a message was sent.

A future approval and WhatsApp handoff milestone owns copying or opening WhatsApp with an approved draft.
