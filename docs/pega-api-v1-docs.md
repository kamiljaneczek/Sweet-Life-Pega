# PegaAPI — REST API Reference

**Version:** v1
**Base URL:** `https://lab-16149-us-east-1.external.pegalabs.io/prweb/api/v1`
**Specification format:** Swagger 2.0

---

## Description

The Pega API provides a set of built-in REST services for Pega applications. All APIs require authentication. Provide the credentials for a Pega operator in the `Authorization` header for each request. Pega recommends accessing APIs using TLS 1.2.

---

## Authentication

All endpoints require HTTP Basic Authentication. Include the operator credentials in the `Authorization` header using the Basic scheme:

```
Authorization: Basic <base64(username:password)>
```

No explicit OAuth or API-key scheme is defined in the specification. Every response may return `401 Unauthorized` if valid credentials are not supplied.

---

## Table of Contents

1. [attachments](#attachments)
   - [POST /attachments/upload](#post-attachmentsupload)
   - [POST /cases/{caseID}/attachments](#post-casescaseidattachments)
   - [GET /cases/{caseID}/attachments](#get-casescaseidattachments)
   - [GET /cases/{caseID}/attachment_categories](#get-casescaseidattachment_categories)
   - [GET /attachments/{attachmentID}](#get-attachmentsattachmentid)
   - [DELETE /attachments/{attachmentID}](#delete-attachmentsattachmentid)
2. [casetypes](#casetypes)
   - [GET /casetypes](#get-casetypes)
   - [GET /casetypes/{ID}](#get-casetypesid)
   - [PUT /casetypes/{ID}/refresh](#put-casetypesidrefresh)
3. [assignments](#assignments)
   - [GET /assignments](#get-assignments)
   - [GET /assignments/{ID}](#get-assignmentsid)
   - [POST /assignments/{ID}](#post-assignmentsid)
   - [GET /assignments/{ID}/actions/{actionID}](#get-assignmentsidactionsactionid)
   - [PUT /assignments/{ID}/actions/{actionID}/refresh](#put-assignmentsidactionsactionidrefresh)
4. [cases](#cases)
   - [GET /cases](#get-cases)
   - [POST /cases](#post-cases)
   - [GET /cases/{ID}](#get-casesid)
   - [PUT /cases/{ID}](#put-casesid)
   - [GET /cases/{ID}/pages/{pageID}](#get-casesidpagespageid)
   - [GET /cases/{ID}/views/{viewID}](#get-casesidviewsviewid)
   - [GET /cases/{ID}/actions/{actionID}](#get-casesidactionsactionid)
   - [PUT /cases/{ID}/actions/{actionID}/refresh](#put-casesidactionsactionidrefresh)
5. [collaboration](#collaboration)
   - [GET /documents](#get-documents)
   - [GET /documents/{ID}](#get-documentsid)
   - [GET /messages](#get-messages)
   - [POST /messages](#post-messages)
   - [GET /notifications](#get-notifications)
   - [POST /notifications](#post-notifications)
   - [GET /spaces](#get-spaces)
   - [GET /spaces/{ID}](#get-spacesid)
   - [PUT /spaces/{ID}/join](#put-spacesidjoin)
   - [PUT /spaces/{ID}/leave](#put-spacesidleave)
   - [GET /spaces/{ID}/pins](#get-spacesidpins)
6. [data](#data)
   - [GET /data/{ID}](#get-dataid)
   - [GET /data/{ID}/metadata](#get-dataidmetadata)
7. [Models / Definitions](#models--definitions)

---

## attachments

Operations for uploading, attaching, retrieving, and deleting file and URL attachments on cases.

---

### POST /attachments/upload

**Summary:** Upload a file to be used as an attachment in a subsequent call

**Description:** Uploads a file to the Pega database or external storage as configured in the application. A unique ID is sent back as the response. This ID is needed to attach the uploaded file to a case.

**Produces:** `application/json`

#### Parameters

This endpoint accepts a multipart file upload in the request body (no explicit Swagger parameter is defined beyond the file payload). No path, query, or named body parameters are declared.

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `201` | Created — file successfully staged. Response body contains the upload ID. Response header `expires` contains the timestamp of expiry of the uploaded file. | `AttachmentsUpload` |
| `400` | Invalid input | `AttachmentErrorResponse_400` |
| `401` | Unauthorized | — |
| `500` | Internal server error | `AttachmentErrorResponse_500` |

#### Response Headers (201)

| Header | Type | Description |
|--------|------|-------------|
| `expires` | `string` | Timestamp of expiry of the uploaded file |

---

### POST /cases/{caseID}/attachments

**Summary:** Attach URL and uploaded file to a case

**Description:** Attaches a URL or a previously uploaded file to a case.

**Consumes:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `caseID` | path | `string` | Yes | Case ID |
| `requestBody` | body | `AddAttachmentRequest` | Yes | Attachments details. Note: `url` field is only required if type is `URL` |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `201` | Created | — |
| `400` | Invalid input | `AttachmentErrorResponse_400` |
| `401` | Unauthorized | — |
| `403` | Insufficient security | `AttachmentErrorResponse_403` |
| `404` | Resource not found | `AttachmentErrorResponse_404` |
| `500` | Internal server error | `AttachmentErrorResponse_500` |

---

### GET /cases/{caseID}/attachments

**Summary:** Get list of attachments of a case

**Description:** Returns the list of all attachments associated with a given case.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `caseID` | path | `string` | Yes | Case ID |
| `includeThumbnails` | query | `boolean` | No | When set to `true`, thumbnail will be part of the response as a base64-encoded string. Enum: `true`, `false` |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `AttachmentListResponse` |
| `401` | Unauthorized | — |
| `404` | Resource not found | `AttachmentErrorResponse_404` |
| `500` | Internal server error | `AttachmentErrorResponse_500` |

---

### GET /cases/{caseID}/attachment_categories

**Summary:** Get list of attachment categories applicable for a case

**Description:** Returns a list of attachment categories for the given case.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `caseID` | path | `string` | Yes | Case ID |
| `type` | query | `string` | No | Type of attachment category. Enum: `File`, `URL` |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `AttachmentCategories` |
| `401` | Unauthorized | — |
| `404` | Resource not found | `AttachmentErrorResponse_404` |
| `500` | Internal server error | `AttachmentErrorResponse_500` |

---

### GET /attachments/{attachmentID}

**Summary:** Get attachment

**Description:** For file attachments, the content is sent back as a base64-encoded string. For URL attachments, the link is sent in plain text. For correspondence attachments, HTML content is returned.

**Produces:** `text/plain`, `text/html`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `attachmentID` | path | `string` | Yes | Attachment ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `AttachmentListItem` |
| `401` | Unauthorized | — |
| `403` | Insufficient security | `AttachmentErrorResponse_403` |
| `404` | Resource not found | `AttachmentErrorResponse_404` |
| `424` | Dependent resource fail | `AttachmentErrorResponse_424` |
| `500` | Internal server error | `AttachmentErrorResponse_500` |

#### Response Headers (200)

| Header | Type | Description |
|--------|------|-------------|
| `content-disposition` | `string` | Contains file name and MIME type |
| `content-type` | `string` | Response content type |
| `transfer-encoding` | `string` | Encoding technique used (e.g., `base64`) |

---

### DELETE /attachments/{attachmentID}

**Summary:** Delete attachment

**Description:** The link between the case and the attachment is deleted. If the attachment has no other links accessing it, the attachment itself is also deleted.

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `attachmentID` | path | `string` | Yes | Attachment ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | — |
| `401` | Unauthorized | — |
| `403` | Insufficient security | `AttachmentErrorResponse_403` |
| `404` | Resource not found | `AttachmentErrorResponse_404` |
| `424` | Dependent resource fail | `AttachmentErrorResponse_424` |
| `500` | Internal server error | `AttachmentErrorResponse_500` |

---

## casetypes

Operations for retrieving and refreshing case type definitions and creation pages.

---

### GET /casetypes

**Summary:** Get case types

**Description:** Gets the case types from the authenticated user's application.

**Produces:** `application/json`

#### Parameters

None.

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `CaseTypesResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### GET /casetypes/{ID}

**Summary:** Get case type details [DX]

**Description:** Gets details about a given case type, including its fields, either with full layout information or as a list.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | CaseType ID |
| `flatListOfFields` | query | `string` | No | If a flat list without layout structure is desired, select `Full` for all UI-based attributes or `Basic` for attributes limited to ensure successful validation. Enum: `Full`, `Basic` |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `CaseTypeDetailResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### PUT /casetypes/{ID}/refresh

**Summary:** Refresh casetype details [DX]

**Description:** Provide field updates to receive an updated creation page, including its fields.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | CaseType ID |
| `refreshFor` | query | `string` | No | Field (or unique identifier of UI element) triggering the refresh |
| `requestBody` | body | `ContentRequest` | Yes | Updated fields |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `CaseTypeDetailResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

## assignments

Operations for listing, retrieving, and acting on work assignments.

---

### GET /assignments

**Summary:** Get assignments

**Description:** Returns the authenticated user's list of assignments.

**Produces:** `application/json`

#### Parameters

None.

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `AssignmentsResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### GET /assignments/{ID}

**Summary:** Get assignment details

**Description:** Returns a single assignment's details given its ID. If the literal string `next` is passed as the ID, returns the next available assignment for the requestor.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Assignment ID or the literal value `next` |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `AssignmentResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | No assignment found or available | `ErrorResponse` |

---

### POST /assignments/{ID}

**Summary:** Perform assignment action

**Description:** Performs an action on an assignment given its ID and an optional content in the request body.

**Consumes:** `application/json`
**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Assignment ID |
| `actionID` | query | `string` | Yes | Assignment action to perform |
| `saveOnly` | query | `boolean` | No | Save field updates only; do not submit for processing |
| `requestBody` | body | `ContentRequest` | No | Content should mirror the clipboard structure |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `AssignmentPostResponse` |
| `400` | Bad request | `ErrorResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Not found | `ErrorResponse` |

---

### GET /assignments/{ID}/actions/{actionID}

**Summary:** Get action details as applied to this assignment [DX]

**Description:** Returns details about an action that can be performed against this assignment, including its fields, either within the view or as a list.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Assignment ID |
| `actionID` | path | `string` | Yes | Assignment action ID |
| `flatListOfFields` | query | `string` | No | If a flat list without layout structure is desired, select `Full` for all UI-based attributes or `Basic` for attributes limited to ensure successful validation. Enum: `Full`, `Basic` |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `ActionResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### PUT /assignments/{ID}/actions/{actionID}/refresh

**Summary:** Refresh action details for this assignment [DX]

**Description:** Provide field updates to receive the updated view/fields of this action.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Assignment ID |
| `actionID` | path | `string` | Yes | Assignment action ID |
| `refreshFor` | query | `string` | No | Field (or unique identifier of UI element) triggering the refresh |
| `requestBody` | body | `ContentRequest` | Yes | Updated fields |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `ActionResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

## cases

Operations for creating, retrieving, and updating cases, as well as accessing case views, pages, and actions.

---

### GET /cases

**Summary:** Get cases

**Description:** Gets all cases that the authenticated user has created in the default work pool.

**Produces:** `application/json`

#### Parameters

None.

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `CasesResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### POST /cases

**Summary:** Create a new case

**Description:** Creates a new case of the given type. The HTTP response header `Location` contains the URI of the newly created case. Input parameters (`content`, `pageInstructions`) are needed only for CaseTypes without CreateStage configuration.

**Consumes:** `application/json`
**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `requestBody` | body | `CreateCaseRequest` | Yes | Case creation parameters. `content` and `pageInstructions` are needed only for CaseTypes without CreateStage configuration |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `201` | Created | `CreateCaseResponse` |
| `400` | Bad request | `ErrorResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

#### Response Headers (201)

| Header | Type | Description |
|--------|------|-------------|
| `Location` | `string` | Contains the URI of the newly created case |
| `ETag` | `string` | Value of the entity tag that must be passed as `If-Match` header in requests to the update case API |

---

### GET /cases/{ID}

**Summary:** Get case details

**Description:** Gets the details of a case given its ID.

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Case ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `CaseResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Not found | `ErrorResponse` |

#### Response Headers (200)

| Header | Type | Description |
|--------|------|-------------|
| `ETag` | `string` | Value of the entity tag that must be passed as `If-Match` header in requests to the update case API |

---

### PUT /cases/{ID}

**Summary:** Update a case

**Description:** Performs an action given a case ID and an optional content in the request body. The `If-Match` header must be populated with the ETag value received from the create case or get case details responses.

**Consumes:** `application/json`
**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Case ID |
| `actionID` | query | `string` | No | Local action or a stage local action to perform |
| `If-Match` | header | `string` | Yes | Value of the entity tag received as `ETag` header in responses to create case and get case details APIs |
| `requestBody` | body | `ContentRequest` | No | Content should mirror the clipboard structure |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `204` | No content | — |
| `400` | Bad request | `ErrorResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Not found | `ErrorResponse` |
| `412` | Precondition failed | `ErrorResponse` |

#### Response Headers (204)

| Header | Type | Description |
|--------|------|-------------|
| `ETag` | `string` | Updated entity tag value for subsequent update requests |

---

### GET /cases/{ID}/pages/{pageID}

**Summary:** Get page details [DX]

**Description:** Gets layout details of a page for a given case.

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Case ID |
| `pageID` | path | `string` | Yes | Page ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `Page` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Not found | `ErrorResponse` |

---

### GET /cases/{ID}/views/{viewID}

**Summary:** Get view details [DX]

**Description:** Gets layout details of a view for a given case.

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Case ID |
| `viewID` | path | `string` | Yes | View ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `View` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Not found | `ErrorResponse` |

---

### GET /cases/{ID}/actions/{actionID}

**Summary:** Get action details as applied to this case [DX]

**Description:** Returns details about an action that can be performed against this case, including its fields, either with full layout information or as a list.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Case ID |
| `actionID` | path | `string` | Yes | Case-wide action ID |
| `flatListOfFields` | query | `string` | No | If a flat list without layout structure is desired, select `Full` for all UI-based attributes or `Basic` for attributes limited to ensure successful validation. Enum: `Full`, `Basic` |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `ActionResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### PUT /cases/{ID}/actions/{actionID}/refresh

**Summary:** Refresh action details for this case [DX]

**Description:** Provide field updates to receive an updated case-wide action view.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Case ID |
| `actionID` | path | `string` | Yes | Case-wide action ID |
| `refreshFor` | query | `string` | No | Field (or unique identifier of UI element) triggering the refresh |
| `requestBody` | body | `ContentRequest` | Yes | Updated fields |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `ActionResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

## collaboration

Operations for documents, messages, notifications, and spaces (collaboration/social features).

---

### GET /documents

**Summary:** Get documents

**Description:** Gets all the documents the authenticated user has access to. Use the `filterBy` parameter to retrieve documents by name (OperatorID), creation date, and so on.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `filterBy` | query | `string` | No | Filter criteria |
| `searchFor` | query | `string` | No | Search criteria |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `DocumentsResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### GET /documents/{ID}

**Summary:** Get document details

**Description:** Returns details of the document for the given document ID. Note that for documents created by uploading files, this API will only return the metadata. The uploaded file content will not be returned.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Document ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `DocumentDetailsResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Document not found | — |

---

### GET /messages

**Summary:** Get messages

**Description:** Retrieve messages for a given context.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `filterBy` | query | `string` | No | If filtering by context, specify the context value in `filterFor`. Enum: `context`, `bookmarkfeed`, `followfeed`, `spacefeed`, `mentionfeed`, `profilefeed`, `repliesfeed` |
| `filterFor` | query | `string` | No | Context or user ID |
| `pageSize` | query | `integer` | No | Maximum number of entries to return |
| `olderThan` | query | `string` (date-time) | No | Only return entries older than this date-time |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `ListOfMessages` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### POST /messages

**Summary:** Create message

**Description:** Create a message.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `requestBody` | body | `CreateMessageRequest` | Yes | Fields needed to create a message |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `201` | Created | `CreateMessageResponse` |
| `400` | Bad request | — |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### GET /notifications

**Summary:** Get notifications

**Description:** Retrieve notifications.

**Produces:** `application/json`

#### Parameters

None.

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `NotificationsResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### POST /notifications

**Summary:** Create notification

**Description:** Create a notification.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `requestBody` | body | `CreateNotificationRequest` | Yes | Fields needed to create a notification |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `201` | Created | `CreateNotificationResponse` |
| `400` | Bad request | — |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### GET /spaces

**Summary:** Get spaces

**Description:** Fetches all the spaces present in the application.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `filterBy` | query | `string` | No | Filter criteria |
| `searchFor` | query | `string` | No | Search string |
| `showUnlisted` | query | `string` | No | Whether to include unlisted spaces |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `SpacesResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |

---

### GET /spaces/{ID}

**Summary:** Get space details

**Description:** Get space details.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Space ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `SpaceDetailsResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Space not found | — |

---

### PUT /spaces/{ID}/join

**Summary:** Join space

**Description:** Join a space.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Space ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `201` | Created | `LeaveOrJoinSpaceResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Space not found | — |

---

### PUT /spaces/{ID}/leave

**Summary:** Leave space

**Description:** Leave a space.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Space ID |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `201` | Created | `LeaveOrJoinSpaceResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Space not found | — |

---

### GET /spaces/{ID}/pins

**Summary:** Get pins for the given space

**Description:** Get pins for the given space.

**Produces:** `application/json`

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Space ID |
| `filterBy` | query | `string` | No | Filter criteria |
| `searchFor` | query | `string` | No | Search string |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `SpacePinsResponse` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Space not found | — |

---

## data

Operations for querying data views (data pages) and retrieving their metadata.

---

### GET /data/{ID}

**Summary:** Get data view contents

**Description:** Gets the contents of a data view given its name and parameters. Parameters are passed as query string parameters. For example, if you have a data view called `D_Customer` with parameters `ID` and `Company`, you can access it with: `https://myco.org/prweb/api/v1/data/D_Customer?ID=1&Company=MyCo`.

> **Note:** Only data views without required parameters can be tested using the Swagger UI "Try it out" feature, since custom data view parameters cannot be entered there.

**Produces:** (dynamic — depends on data view content)

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Data view identifier (e.g., `D_Customer`) |

> Additional query string parameters corresponding to the data view's declared parameters may be appended to the URL at runtime.

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Not found | `ErrorResponse` |

---

### GET /data/{ID}/metadata

**Summary:** Get data view metadata

**Description:** Gets the metadata of a data view given its name.

#### Parameters

| Name | Location | Type | Required | Description |
|------|----------|------|----------|-------------|
| `ID` | path | `string` | Yes | Data view identifier |

#### Responses

| Status Code | Description | Schema |
|-------------|-------------|--------|
| `200` | OK | `DataPageMetadata` |
| `401` | Unauthorized | — |
| `403` | Forbidden | `ErrorResponse` |
| `404` | Not found | `ErrorResponse` |

---

## Models / Definitions

All data models referenced throughout the API are defined below. The models are presented alphabetically. Cross-references to nested models are noted.

---

### Action

Represents a case-wide action that can be performed on a case.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `AddExpense` | Action identifier |
| `name` | `string` | No | `Add expense` | Human-readable action name |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Action` | Pega internal class name |

---

### ActionProcess

Describes the parameters of a client-side action invocation.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `setValuePairs` | array of `ValuePairs` | No | Key-value pairs to set |
| `functionParameters` | array of `FunctionParams` | No | Parameters for a function call |
| `functionName` | `string` | No | Name of the function |
| `actionName` | `string` | No | Name of the action |
| `urlBase` | `string` | No | Base URL for the action |
| `windowName` | `string` | No | Target window name |
| `windowOptions` | `string` | No | Window options string |
| `alternateDomain` | `AltDomain` | No | Alternate domain for cross-domain actions |
| `queryParams` | array of `QueryParams` | No | Query parameters to include |
| `localAction` | `string` | No | Name of the local action |
| `target` | `string` | No | Type of display for the local action |
| `localActionFormat` | `string` | No | Format for the local action |
| `customTemplate` | `string` | No | Name of the template (look) for the local action |

---

### ActionResponse

Returned when retrieving details about a case or assignment action in DX mode.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `actionID` | `string` | No | `Resolve` | Action identifier |
| `caseID` | `string` | No | `MYCO-PAC-WORK C-27` | Associated case identifier |
| `name` | `string` | No | `Resolve action` | Human-readable action name |
| `view` | `View` | No | — | Layout view associated with this action |

---

### ActionSet

Defines a set of client actions bound to UI events.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `actions` | array of `ClientAction` | No | Client actions to execute |
| `events` | array of `Event` | No | UI events that trigger the action set |

---

### AddAttachmentRequest

Request body for attaching files or URLs to a case.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `attachments` | array / `AttachmentRequest` | No | Attachment details. See `AttachmentRequest` |

---

### AltDomain

Represents an alternate domain for cross-domain link actions.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | `string` | No | Static URL string |
| `urlReference` | `URLReference` | No | Dynamic URL reference from a property |

---

### Assignment

Represents a single assignment (work item) in a user's worklist or workbasket.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `caseID` | `string` | No | `MYCO-PAC-WORK E-278` | ID of the related case |
| `executedDeadlineTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Actual deadline execution time |
| `executedGoalTime` | `string` (date-time) | No | `2015-02-05T08:00:44.443Z` | Actual goal execution time |
| `ID` | `string` | No | `ASSIGN-WORKLIST MYCO-PAC-WORK E-278!PZDEFAULTSTAGESTEP` | Assignment identifier |
| `name` | `string` | No | `Default step` | Assignment step name |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Assignment` | Pega internal class name |
| `routedTo` | `string` | No | `user1` | Operator or workbasket to which the assignment is routed |
| `scheduledDeadlineTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Scheduled deadline |
| `scheduledGoalTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Scheduled goal |
| `type` | `string` | No | `Worklist` | Assignment type (Worklist or Workbasket) |
| `urgency` | `string` | No | `10` | Numeric urgency value |
| `instructions` | `string` | No | `Default stage` | Assignment instructions text |

---

### AssignmentAction

Represents a performable action on an assignment.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `AddExpense` | Action identifier |
| `name` | `string` | No | `Add expense` | Human-readable action name |
| `type` | `string` | No | `Assignment` | Action type |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Action` | Pega internal class name |

---

### AssignmentPostResponse

Returned after performing an action on an assignment.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `nextAssignmentID` | `string` | No | `ASSIGN-WORKLIST MYCO-PAC-WORK E-110!PYSTARTCASE` | ID of the next assignment in the workflow |
| `nextPageID` | `string` | No | `Confirm` | ID of the next page to display |

---

### AssignmentResponse

Detailed response for a single assignment, including its available actions.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `ASSIGN-WORKLIST MYCO-PAC-WORK E-110!PYSTARTCASE` | Assignment identifier |
| `caseID` | `string` | No | `MYCO-PAC-WORK E-110` | Associated case ID |
| `name` | `string` | No | `ExpenseReport` | Assignment name |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Assignment` | Pega internal class name |
| `type` | `string` | No | `Worklist` | Assignment type |
| `routedTo` | `string` | No | `user1` | Routed operator or workbasket |
| `instructions` | `string` | No | `Default step` | Instructions text |
| `scheduledGoalTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Scheduled goal time |
| `executedGoalTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Executed goal time |
| `scheduledDeadlineTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Scheduled deadline |
| `executedDeadlineTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Executed deadline |
| `urgency` | `string` | No | `10` | Numeric urgency |
| `actions` | array of `AssignmentAction` | No | — | Available actions for this assignment |

---

### AssignmentsResponse

Top-level response for the list of assignments.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement` | Pega internal class name |
| `assignments` | array of `Assignment` | No | — | List of assignments |

---

### AttachmentCategories

Response containing the list of attachment categories applicable to a case.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `attachment_categories` | array of `AttachmentCategory` | No | Attachment category definitions |

---

### AttachmentCategory

Defines an attachment category and the permissions the current user has on it.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | No | `Custom file category` | Display name of the category |
| `ID` | `string` | No | `CustomFileCategory` | Identifier of the category |
| `canView` | `boolean` | No | `true` | User can view attachments of this category |
| `canDeleteOwn` | `boolean` | No | `true` | User can delete their own attachments of this category |
| `canEdit` | `boolean` | No | `true` | User can edit attachments of this category |
| `canCreate` | `boolean` | No | `true` | User can add attachments of this category |
| `canDeleteAll` | `boolean` | No | `true` | User can delete any attachment of this category |

---

### AttachmentError

Individual error detail within an attachment error response.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `message` | `string` | No | `Error_` | Error message text |
| `localizedValue` | `string` | No | `<>` | Localized message string |
| `errorCode` | `string` | No | — | Error code identifier |
| `errorCodeLabel` | `string` | No | — | Human-readable label for the error code |
| `errorClassification` | `string` | No | — | Classification category of the error |
| `erroneousInputOutputFieldInPage` | `string` | No | — | The erroneous field in the page |
| `erroneousInputOutputIdentifier` | `string` | No | — | Identifier of the erroneous input/output |
| `messageParameters` | array of `string` | No | — | Parameters substituted into the message template |
| `messageDetails` | `string` | No | — | Detailed error message |

---

### AttachmentErrorResponse_400

Error response body for HTTP 400 (Invalid input) attachment errors.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `errorClassification` | `string` | No | `Invalid inputs` | Top-level error classification |
| `localizedValue` | `string` | No | `<>` | Localized top-level message |
| `errorDetails` | array of `AttachmentError` | No | — | Detailed error entries |

---

### AttachmentErrorResponse_403

Error response body for HTTP 403 (Insufficient security) attachment errors.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `errorClassification` | `string` | No | `Insufficient security` | Top-level error classification |
| `localizedValue` | `string` | No | `<>` | Localized top-level message |
| `errorDetails` | array of `AttachmentError` | No | — | Detailed error entries |

---

### AttachmentErrorResponse_404

Error response body for HTTP 404 (Resource not found) attachment errors.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `errorClassification` | `string` | No | `Resource not found` | Top-level error classification |
| `localizedValue` | `string` | No | `<>` | Localized top-level message |
| `errorDetails` | array of `AttachmentError` | No | — | Detailed error entries |

---

### AttachmentErrorResponse_424

Error response body for HTTP 424 (Dependent resource fail) attachment errors.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `errorClassification` | `string` | No | `Dependent resource fail` | Top-level error classification |
| `localizedValue` | `string` | No | `<>` | Localized top-level message |
| `errorDetails` | array of `AttachmentError` | No | — | Detailed error entries |

---

### AttachmentErrorResponse_500

Error response body for HTTP 500 (Internal server error) attachment errors.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `errorClassification` | `string` | No | `Internal server error` | Top-level error classification |
| `localizedValue` | `string` | No | `<>` | Localized top-level message |
| `errorDetails` | array of `AttachmentError` | No | — | Detailed error entries |

---

### AttachmentLink

Represents a hypermedia link for downloading or deleting an attachment.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `rel` | `string` | No | `self` | Relation of this link to the attachment |
| `href` | `string` | No | `/attachments/LINK-ATTACHMENT OPTRDJ-LOCALAPP-WORK I-2007!20200514T150138.932 GMT` | Endpoint URL |
| `title` | `string` | No | `Download the attachment` | Descriptive title for the link |
| `type` | `string` | No | `GET/DELETE` | HTTP method(s) applicable to this link |

---

### AttachmentLinks

Container for hypermedia links associated with an attachment list item.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `download/delete` | `AttachmentLink` | No | Link object for downloading or deleting the attachment |

---

### AttachmentListItem

Represents a single item in the attachment list for a case.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `extension` | `string` | No | `docx` | File extension |
| `fileName` | `string` | No | `myDoc.docx` | File name |
| `createdBy` | `string` | No | `operator1` | Operator who attached the file |
| `createTime` | `string` | No | `2020-05-14T15:01:38.932Z` | Time the attachment was added |
| `links` | `AttachmentLinks` | No | — | Hypermedia links for download/delete |
| `ID` | `string` | No | `LINK-ATTACHMENT OPTRDJ-LOCALAPP-WORK I-2007!20200514T150138.932 GMT` | Attachment identifier |
| `category` | `string` | No | `File` | Attachment category |
| `type` | `string` | No | `FILE` | Type of attachment (`FILE` or `URL`) |

---

### AttachmentListResponse

Top-level response for the list of case attachments.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `attachments` | array of `AttachmentListItem` | No | List of attachment items |

---

### AttachmentRequest

Describes a single attachment to add to a case.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `type` | `string` | No | `File` | Type of attachment. Enum: `File`, `URL` |
| `category` | `string` | No | `File` | Attachment category |
| `name` | `string` | No | `myFile` | File name |
| `ID` | `string` | No | `213e8449-102e-492d-b883-afdf64da0d78` | Uploaded file ID from `POST /attachments/upload` |
| `url` | `string` | No | `www.somewebsite.com` | URL for a URL-type attachment |

---

### AttachmentsUpload

Response body for the file upload endpoint.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `ID` | `string` | No | Unique ID received upon uploading a file via `POST /attachments/upload`. Use this ID in subsequent attachment requests |

---

### attachments

Describes an attachment entry within a `ContentRequest` (used when submitting form data with attachments).

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `type` | `string` | No | `File` | Type of attachment. Enum: `File`, `URL` |
| `attachmentFieldName` | `string` | No | `myAttachmentField` | Reference to the attachment field property. Should not start with a leading dot |
| `category` | `string` | No | `myFile` | Attachment category |
| `name` | `string` | No | `myAttachment` | Name of the attachment. Not required if the name matches the uploaded file name |
| `ID` | `string` | No | `213e8449-102e-492d-b883-afdf64da0d78` | ID received from `POST /attachments/upload` |
| `delete` | `boolean` | No | `false` | When `true`, clears an existing attachment field on form submission. If `delete` is `true`, `type` must be `File` with a valid field name, and no other fields should be included |

---

### Caption

Represents a caption (column header label) element within a layout.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `columnImportance` | `string` | No | `primary` | Determines how the column responds to narrow viewports. Enum: `primary`, `secondary`, `other` |
| `captionFor` | `string` | No | `purchaseAmount` | Reference to the field this caption belongs to |
| `control` | `Control` | No | — | Control configuration for the caption |
| `value` | `string` | No | `Enter the amount` | Caption text (XSS-encoded) |
| `format` | `string` | No | — | Label format |
| `testID` | `string` | No | — | Unique test identifier |
| `columnWidth` | `string` | No | — | Width of the column, only present when `columnImportance` has a value |
| `columnUnits` | `string` | No | — | Units for column width; blank defaults to `px` |

---

### Case

Represents a single case in a list response.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `MYCO-PAC-WORK E-26` | Case identifier |
| `parentCaseID` | `string` | No | `MyCo-PAC-Work` | Parent case identifier |
| `caseTypeID` | `string` | No | `MyCo-PAC-Work-ExpenseReport` | Case type identifier |
| `name` | `string` | No | `ExpenseReport` | Case name |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Case` | Pega internal class name |
| `stage` | `string` | No | `Stage 1` | Current stage of the case |
| `status` | `string` | No | `New` | Current status of the case |
| `urgency` | `string` | No | `90` | Numeric urgency value |
| `createTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Case creation timestamp |
| `createdBy` | `string` | No | `John Doe` | Operator who created the case |
| `lastUpdateTime` | `string` (date-time) | No | `2015-02-05T20:00:44.443Z` | Last update timestamp |
| `lastUpdatedBy` | `string` | No | `manager@pmf.com` | Operator who last updated the case |

---

### CaseAssignment

An assignment record as embedded in a case detail response.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `ASSIGN-WORKLIST MYCO-PAC-WORK E-110!PYSTARTCASE` | Assignment identifier |
| `name` | `string` | No | `ExpenseReport` | Assignment name |
| `type` | `string` | No | `Worklist` | Assignment type |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Assignment` | Pega internal class name |
| `routedTo` | `string` | No | `user1` | Routed operator or workbasket |
| `instructions` | `string` | No | `10` | Assignment instructions |
| `scheduledGoalTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Scheduled goal time |
| `executedGoalTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Executed goal time |
| `scheduledDeadlineTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Scheduled deadline |
| `executedDeadlineTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Executed deadline |
| `urgency` | `string` | No | `10` | Numeric urgency |
| `actions` | array of `Action` | No | — | Available actions |

---

### CaseResponse

Detailed response for a single case, including stages, SLA, child cases, assignments, and actions.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `status` | `string` | No | `New` | Current status |
| `caseTypeID` | `string` | No | `MyCo-PAC-Work-Timesheet` | Case type identifier |
| `name` | `string` | No | `Timesheet` | Case name |
| `ID` | `string` | No | `MYCO-PAC-WORK T-240` | Case identifier |
| `parentCaseID` | `string` | No | `MYCO-PAC-WORK T-200` | Parent case identifier |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Case` | Pega internal class name |
| `stage` | `string` | No | `PRIM1` | Current stage identifier |
| `urgency` | `string` | No | `15` | Numeric urgency |
| `createTime` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Case creation timestamp |
| `createdBy` | `string` | No | `administrator@pmf.com` | Creator operator ID |
| `lastUpdateTime` | `string` (date-time) | No | `2015-02-05T22:00:44.443Z` | Last update timestamp |
| `lastUpdatedBy` | `string` | No | `manager@pmf.com` | Last updater operator ID |
| `owner` | `string` | No | `user@pmf.com` | Owner operator ID |
| `content` | `Content` | No | — | Case field values (clipboard-structured object) |
| `stages` | array of `Stage` | No | — | All stages of the case |
| `SLA` | `SLA` | No | — | Service Level Agreement timestamps |
| `childCases` | array of `ChildCase` | No | — | Child case references |
| `childCaseTypes` | array of `CaseType` | No | — | Available child case types |
| `assignments` | array of `CaseAssignment` | No | — | Active assignments on the case |
| `actions` | array of `Action` | No | — | Available case-wide actions |

---

### CaseType

Represents a case type available to the current user.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `MyCo-PAC-Work-ExpenseReport` | Case type identifier |
| `name` | `string` | No | `Expense Report` | Display name |
| `CanCreate` | `boolean` | No | `true` | Whether the current user can create this case type |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-CaseType` | Pega internal class name |
| `startingProcesses` | array of `StartingProcess` | No | — | Available starting processes for creation |

---

### CaseTypeDetailResponse

Response for a case type's detail and its creation page layout.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `caseTypeID` | `string` | No | `MyCo-PAC-Work-Timesheet` | Case type identifier |
| `creation_page` | `Page` | No | — | Layout of the case creation page |

---

### CaseTypesResponse

Top-level response for the case types listing.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `applicationIsConstellationCompatible` | `boolean` | No | `true` | Indicates whether the application is compatible with the Constellation UI framework |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement` | Pega internal class name |
| `caseTypes` | array of `CaseType` | No | — | List of available case types |

---

### CaseUpdateResponse

Response after a case update operation (supplemental; the primary update response is HTTP 204).

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `nextAssignmentID` | `string` | No | `ASSIGN-WORKLIST MYCO-PAC-WORK E-110!PYSTARTCASE` | Next assignment in the workflow |
| `nextPageID` | `string` | No | `Confirm` | Next page to display |

---

### CasesResponse

Top-level response for the cases listing.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement` | Pega internal class name |
| `cases` | array of `Case` | No | — | List of cases |

---

### ChildCase

A reference to a child case embedded within a case detail response.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `MYCO-PAC-WORK S-240` | Child case identifier |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Case` | Pega internal class name |

---

### ClientAction

Represents a client-side action (e.g., refresh, setValue, takeAction) associated with a UI event.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `action` | `string` | No | — | The action type. Enum: `postValue`, `refresh`, `setValue`, `takeAction`, `openUrlInWindow`, `runScript` |
| `refreshFor` | `string` | No | — | Name of the control or unique ID to refresh for |
| `actionProcess` | `ActionProcess` | No | — | Parameters and details of the action process |

---

### Content

Represents the case clipboard content object. This is a free-form JSON object that mirrors the Pega clipboard page structure.

> This model is defined as `type: object` with no fixed properties. The structure varies by case type and is determined by the application's data model.

---

### ContentRequest

Standard request body used for performing assignment actions, updating cases, and refreshing views.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `content` | `Content` | No | Field values mirroring the clipboard structure |
| `pageInstructions` | array of `pageInstruction` | No | Instructions for manipulating embedded pages, page lists, and page groups |
| `attachments` | array of `attachments` | No | Attachment entries to process with the action |

---

### Control

Describes the UI control configuration for a field or caption.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `type` | `string` | No | `pxDropDown` | Control type identifier. Determines which fields appear in `modes` |
| `modes` | array of `Mode` | No | — | Mode configurations (editable, readOnly) |
| `actionSets` | array of `ActionSet` | No | — | Action sets bound to UI events |
| `label` | `string` | No | `Press here for more details` | Label for the button or link (XSS-encoded) |

---

### CreateCaseRequest

Request body for creating a new case.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `caseTypeID` | `string` | **Yes** | `MyCo-PAC-Work-ExpenseReport` | Case type to instantiate |
| `processID` | `string` | No | — | Starting process identifier |
| `parentCaseID` | `string` | No | — | Parent case ID for creating a child case |
| `content` | `Content` | No | — | Initial field values (only for CaseTypes without CreateStage) |
| `pageInstructions` | array of `pageInstruction` | No | — | Page manipulation instructions |
| `attachments` | array of `attachments` | No | — | Attachments to associate on creation |

---

### CreateCaseResponse

Response body after successfully creating a case.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `MYCO-PAC-WORK E-107` | Newly created case identifier |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Case` | Pega internal class name |
| `nextAssignmentID` | `string` | No | `ASSIGN-WORKLIST MYCO-PAC-WORK E-110!PYSTARTCASE` | Next assignment to process |
| `nextPageID` | `string` | No | `Confirm` | Next page to display |

---

### CreateMessageRequest

Request body for creating a collaboration message.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `postMessage` | `postMessageRequest` | No | Message body and context |

> Note: The specification marks `messageText` as required at the definition level, but the structured field that carries it is `postMessage.message`.

---

### CreateMessageResponse

Response body after creating a message.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `PEGASOCIAL-MESSAGE M-67` | Identifier of the created message |

---

### CreateNotificationRequest

Request body for creating a notification.

> This model is defined as an empty object (`type: object`). The expected fields depend on the application configuration.

---

### CreateNotificationResponse

Response body after creating a notification.

> This model is defined as an empty object (`type: object`). The response fields depend on the application configuration.

---

### DataPageMetadata

Metadata describing a data view (data page).

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `dataTypeID` | `string` | No | `Data-Rule-AppMetadata` | Data type class identifier |
| `description` | `string` | No | `This page contains data explorer information to be displayed` | Human-readable description of the data view |
| `usage` | `string` | No | `Data explorer information` | Usage notes |
| `ID` | `string` | No | `D_pyDataExplorer` | Data view identifier |
| `name` | `string` | No | `D_pyDataExplorer` | Data view name |
| `structure` | `string` | No | `list` | Structure type (e.g., `list` or `page`) |
| `parameters` | array of `Parameter` | No | — | Declared parameters for the data view |

---

### DocumentDetailsResponse

Full details for a single document, including its content.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Document` | Pega internal class name |
| `createdByName` | `string` | No | `Vinesh` | Display name of the creator |
| `lastUpdatedBy` | `string` | No | `ketiv` | Operator ID of the last updater |
| `createdBy` | `string` | No | `ketiv` | Operator ID of the creator |
| `createTime` | `string` | No | `2019-05-03T08:53:17.830Z` | Creation timestamp |
| `documentAccessibleTo` | `string` | No | `Public` | Access scope of the document |
| `documentContent` | `string` | No | `<p>Pegasystems Inc. ...</p>` | HTML content of the document |
| `ID` | `string` | No | `PEGASOCIAL-DOCUMENT DOC-974` | Document identifier |
| `title` | `string` | No | `About Pega` | Document title |
| `lastUpdatedByName` | `string` | No | `Vinesh` | Display name of the last updater |
| `lastUpdateTime` | `string` | No | `2019-05-03T08:56:58.612Z` | Last update timestamp |

---

### DocumentsResponse

Summary-level response for a single document in a list.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Document` | Pega internal class name |
| `createdByName` | `string` | No | `Vinesh` | Display name of the creator |
| `lastUpdatedBy` | `string` | No | `ketiv` | Operator ID of the last updater |
| `createdBy` | `string` | No | `ketiv` | Operator ID of the creator |
| `createTime` | `string` | No | `2019-05-03T08:53:17.000Z` | Creation timestamp |
| `ID` | `string` | No | `PEGASOCIAL-DOCUMENT DOC-974` | Document identifier |
| `title` | `string` | No | `About Pega` | Document title |
| `lastUpdatedByName` | `string` | No | `Vinesh` | Display name of the last updater |
| `lastUpdateTime` | `string` | No | `2019-05-03T08:56:58.000Z` | Last update timestamp |

---

### Error

Represents a single error in a standard error response.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `Pega_API_XXX` | Error code identifier |
| `message` | `string` | No | `<>` | Error message text |
| `pxObjClass` | `string` | No | `Pega-API-Error` | Pega internal class name |

---

### ErrorResponse

Standard error response used across case management endpoints.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `pxObjClass` | `string` | No | `Pega-API` | Pega internal class name |
| `errors` | array of `Error` | No | — | List of error details |

---

### Event

Represents a UI event that triggers an action set.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `event` | `string` | No | The event type. Enum: `click`, `doubleclick`, `focus`, `hover`, `rightclick`, `load`, `enter`, `up`, `down`, `left`, `right`, `esc`, `tab`, `any`, `change`, `playing`, `pause`, `ended`, `onLoad` |

---

### Field

Represents a form field within a layout group or row.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `reference` | `string` | No | `Dependent.Age` | Path in the case hierarchy to this field |
| `validationMessages` | `string` | No | `The child age must be between 0 and 18` | Field-level validation errors (returned by refresh APIs) |
| `validateAs` | `string` | No | `ageValidator` | Name of the Edit-Validate rule on the property |
| `fieldID` | `string` | No | `Age` | Field identifier |
| `name` | `string` | No | `?` | Name from the property rule |
| `readOnly` | `boolean` | No | `false` | Whether the field is read-only |
| `visible` | `boolean` | No | `true` | Whether the field is currently visible |
| `labelReserveSpace` | `boolean` | No | `true` | Whether to reserve space for a missing label |
| `label` | `string` | No | `Child's age` | Label text (XSS-encoded) |
| `showLabel` | `boolean` | No | `true` | Only applicable for `pxButton`, `pxIcon`, and `pxLink` controls |
| `required` | `boolean` | No | `false` | Whether the field is required |
| `labelFormat` | `string` | No | `standard` | Label display format |
| `disabled` | `boolean` | No | `true` | Whether the field is disabled |
| `value` | `string` | No | `18` | Current value (XSS-encoded) |
| `maxLength` | `integer` | No | `32` | Maximum character length |
| `expectedLength` | `integer` | No | `10` | Expected length (used to size the input control) |
| `type` | `string` | No | `Text` | Field data type. Enum: `Text`, `Identifier`, `None`, `Email`, `Decimal`, `Date`, `DateTime`, `TimeOfDay`, `Integer`, `Password`, `TextEncrypted`, `TrueFalse` |
| `control` | `Control` | No | — | Control configuration |
| `testID` | `string` | No | — | Unique identifier for automated testing |
| `isEncrypted` | `boolean` | No | `true` | If `true`, the `value` is encrypted |
| `isMasked` | `boolean` | No | `true` | If `true`, the `value` is masked (shown as dots) |
| `accessCondition` | `string` | No | — | Access condition expression |
| `valueFormatting` | `string` | No | — | Formatting applied to the value for display |

---

### FunctionParams

Key-value pair for a function parameter within an `ActionProcess`.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | No | Static value |
| `name` | `string` | No | Parameter name |
| `valueReference` | `ValueReference` | No | Dynamic value from a property reference |

---

### Group

A polymorphic layout unit within a layout. May contain a nested layout, field, view, paragraph, caption, or row break.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `layout` | `Layout` | No | Nested layout |
| `field` | `Field` | No | A form field |
| `view` | `View` | No | A nested view |
| `paragraph` | `Paragraph` | No | A paragraph block |
| `caption` | `Caption` | No | A column caption |
| `newRow` | `NewRow` | No | A row break marker |
| `title` | `string` | No | Title displayed over this layout group |
| `titleFormat` | `string` | No | Format applied to the title |

---

### Header

Represents the header row of a table or repeating layout.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `groups` | array of `Group` | No | Groups forming the header row |

---

### Layout

A layout element that structures fields, views, and sub-layouts within a page or view.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `titleFormat` | `string` | No | — | Title style. Valid styles: `Heading 1` through `Heading 6` |
| `containerFormat` | `string` | No | — | Container style format |
| `groupFormat` | `string` | No | `Grid` | Row grouping format. Enum: `Grid`, `Dynamic`, `Inline` |
| `layoutFormat` | `string` | No | `SIMPLELAYOUT` | Layout type. Enum: `SCREENLAYOUT`, `SIMPLELAYOUT`, `NONE`, `TABLELAYOUT`, `REPEATINGLAYOUT`. Top-level groups use `SCREENLAYOUT`; nested layouts use the others |
| `title` | `string` | No | — | Layout title (XSS-encoded) |
| `visible` | `boolean` | No | `true` | Whether the layout is visible |
| `view` | `View` | No | — | Nested view (used instead of groups for some layout formats) |
| `groups` | array of `Group` | No | — | Child groups |
| `reference` | `string` | No | — | Page list or page group reference (for `TABLELAYOUT`/`REPEATINGLAYOUT`) |
| `sourceType` | `string` | No | `Property` | Source type for repeating layout. Enum: `Property`, `DataPage` |
| `fieldListID` | `string` | No | `OrderItems` | Field list identifier |
| `referenceType` | `string` | No | — | `List` or `Group` (for `TABLELAYOUT`/`REPEATINGLAYOUT`) |
| `header` | `Header` | No | — | Header row for the layout |
| `newRow` | reference | No | — | New row template |
| `rows` | array of `Row` | No | — | Data rows |
| `readOnly` | `boolean` | No | `false` | Whether the pagelist/pagegroup is read-only |
| `repeatRowOperations` | `RepeatRow` | No | — | Row editing configuration |
| `repeatLayoutFormat` | `string` | No | — | Layout format for repeating sections |
| `repeatContainerFormat` | `string` | No | — | Container format for repeating sections |
| `displayGridHeader` | `boolean` | No | — | Whether to display the grid header |
| `displayGridFooter` | `boolean` | No | — | Whether to display the grid footer |
| `groupsVisibility` | `boolean` | No | `true` | Visibility of child groups |

---

### LeaveOrJoinSpaceResponse

Response body after joining or leaving a space.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `success` | `string` | No | `true` | Whether the operation succeeded |

---

### ListOfMessages

Top-level paginated response for messages.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `entryCount` | `integer` | No | `3` | Number of entries in this page |
| `pageFirstEntry` | `string` (date-time) | No | `20190617T165841.000 GMT` | Timestamp of the first entry on this page |
| `pageLastEntry` | `string` (date-time) | No | `20190617T165820.000 GMT` | Timestamp of the last entry on this page |
| `messages` | array of `MessagesResponse` | No | — | List of messages |

---

### MessageReplies

Represents a reply to a message.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `context` | `string` | No | `OTL165-PURCHASEREQUEST-WORK D-231` | Context (e.g., case ID) of the reply |
| `currentContext` | `string` | No | `case` | Current context type |
| `ID` | `string` | No | `PEGASOCIAL M-67` | Reply message identifier |
| `message` | `string` | No | `That's a great idea` | Reply text |
| `postedBy` | `string` | No | `marik` | Operator who posted the reply |
| `postedTime` | `string` (date-time) | No | `2019-06-17T16:58:41.000Z` | Time the reply was posted |

---

### MessagesResponse

Represents a single message in the messages list.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `context` | `string` | No | `OTL165-PURCHASEREQUEST-WORK D-231` | Context identifier (typically a case ID) |
| `contextDescription` | `string` | No | `Purchase Request` | Human-readable context description |
| `contextID` | `string` | No | `D-231` | Short context identifier |
| `contextType` | `string` | No | `case` | Type of context (e.g., `case`) |
| `currentContext` | `string` | No | `case` | Current context type |
| `ID` | `string` | No | `PEGASOCIAL M-67` | Message identifier |
| `message` | `string` | No | `That's a great idea` | Message text |
| `postedBy` | `string` | No | `marik` | Operator who posted the message |
| `postedTime` | `string` (date-time) | No | `2019-06-17T16:58:41.000Z` | Time the message was posted |
| `updatedTime` | `string` (date-time) | No | `2019-06-17T16:58:41.000Z` | Time the message was last updated |
| `replies` | array of `MessageReplies` | No | — | Replies to this message |

---

### Mode

Describes the editable or read-only configuration of a control, including list source, date formatting, and display options.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `modeType` | `string` | No | `editable` | Mode of the control. Enum: `editable`, `readOnly`, `ignore` |
| `controlFormat` | `string` | No | `Standard` | Control format style |
| `textAlign` | `string` | No | `Right` | Text alignment. Enum: `Left`, `Right` |
| `tooltip` | `string` | No | — | Tooltip text (XSS-encoded) |
| `maxChar` | `string` | No | — | Maximum character count |
| `minChars` | `string` | No | — | Minimum character count |
| `formatType` | `string` | No | `datetime` | Format type. Enum: `none`, `text`, `date`, `datetime`, `email`, `number`, `tel`, `url`, `truefalse`, `advancedtext` |
| `specifySize` | `string` | No | `auto` | Size specification |
| `showReadOnlyValidation` | `boolean` | No | — | Whether to show read-only validation |
| `listSource` | `string` | No | `datapage` | Source for list-type controls. Enum: `promptlist`, `locallist`, `datapage` |
| `loadMode` | `string` | No | `auto` | How the data page is loaded. Enum: `auto`, `deferload`, `lazyload` |
| `options` | array of `Option` | No | — | Dropdown/radio button options (for `promptlist`/`locallist` sources) |
| `dataPageID` | `string` | No | `D_GetTeams` | Data page identifier (for `datapage` source) |
| `dataPageValue` | `string` | No | `TeamName` | Field in the data page to use as the value |
| `dataPagePrompt` | `string` | No | `TeamName` | Field in the data page to use as the display prompt |
| `dataPageTooltip` | `string` | No | — | Field in the data page to use as the tooltip |
| `useSearchDPValue` | `boolean` | No | `true` | If `true`, use the data page value for search |
| `useSearchDPPrompt` | `boolean` | No | `true` | If `true`, use the data page prompt for search |
| `useSearchDPTooltip` | `boolean` | No | `true` | If `true`, use the data page tooltip for search |
| `enableGrouping` | `boolean` | No | — | Whether to enable grouping |
| `groupBy` | `string` | No | — | Field to group by |
| `groupOrder` | `string` | No | — | Group sort order. Enum: `asc`, `desc` |
| `maxResults` | `string` | No | — | Maximum results to return |
| `minResults` | `string` | No | — | Minimum results required |
| `minSearch` | `string` | No | — | Minimum search characters |
| `clipboardPageID` | `string` | No | — | Clipboard page identifier |
| `clipboardPageValue` | `string` | No | — | Clipboard page value field |
| `clipboardPagePrompt` | `string` | No | — | Clipboard page prompt field |
| `clipboardPageTooltip` | `string` | No | — | Clipboard page tooltip field |
| `useSearchCPValue` | `boolean` | No | `true` | Use clipboard page value for search |
| `useSearchCPPrompt` | `boolean` | No | `true` | Use clipboard page prompt for search |
| `useSearchCPTooltip` | `boolean` | No | `true` | Use clipboard page tooltip for search |
| `obfuscated` | `boolean` | No | — | Whether the value is obfuscated |
| `dateFormat` | `string` | No | `Date-Short` | Date display format. Enum: `Date-Short`, `Date-Short-YYYY`, `Date-Short-Custom`, `Date-Short-Custom-YYYY`, `Date-Medium`, `Date-DayMonthYear-Custom`, `Date-Full`, `Date-Long`, `Date-ISO-8601`, `Date-Gregorian-1`, `Date-Gregorian-2`, `Date-Gregorian-3` |
| `dateTimeFormat` | `string` | No | `DateTime-Short` | Date-time display format. Enum: `DateTime-Short`, `DateTime-Short-Custom`, `DateTime-Short-YYYY-Custom`, `DateTime-Short-YYYY`, `DateTime-Medium`, `DateTime-DayMonthYear-Custom`, `DateTime-Full`, `DateTime-Long`, `DateTime-Frame`, `DateTime-Frame-Short`, `DateTime-ISO-8601`, `DateTime-Gregorian-1`, `DateTime-Gregorian-2`, `DateTime-Gregorian-3` |
| `customDateFormat` | `string` | No | — | Custom date format string |
| `showAs24HourFormat` | `boolean` | No | — | Whether to use 24-hour time format |
| `useFutureDateRange` | `boolean` | No | `true` | Whether to restrict to future dates |
| `futureDateRange` | `string` | No | — | Future date range value |
| `usePastDateRange` | `boolean` | No | `true` | Whether to restrict to past dates |
| `pastDateRange` | `string` | No | — | Past date range value |
| `linkType` | `string` | No | `url` | Link type for `pxLink` control. Enum: `one`, `email`, `tel`, `url` |
| `linkData` | `string` | No | `www.yahoo.com` | Link URL for `pxLink` control |
| `linkImageSource` | `string` | No | `styleClass` | Image source for `pxLink`. Enum: `none`, `image`, `property`, `styleclass` |
| `linkImagePosition` | `string` | No | `left` | Image position for `pxLink`. Enum: `left`, `right` |
| `linkImage` | `string` | No | — | Link image value |
| `linkProperty` | `string` | No | — | Property used as link |
| `linkStyle` | `string` | No | `pi pi-checkmark` | CSS style class for the link icon |
| `iconSource` | `string` | No | `standardicon` | Icon source for `pxIcon`. Enum: `standardicon`, `image`, `exturl`, `property`, `styleclass` |
| `iconStandard` | `string` | No | `pxIconDeleteItem` | Standard icon name. Enum: `pxIcon`, `pxIconAddItem`, `pxIconAddNewWork`, `pxIconAttachments`, `pxCancel`, `pxIconContents`, `pxIconDeleteItem`, `pxIconEnableActionSection`, `pxIconExpandCollapse`, `pxIconExplore`, `pxIconFinishAssignment`, `pxIconGetNextWork`, `pxIconHistory`, `pxIconLocalAction`, `pxIconPrint`, `pxIconReopenWorkItem`, `pxIconReview`, `pxIconSave`, `pxIconShowFlowLocation`, `pxIconShowHarness`, `pxIconShowReopenScreen`, `pxIconSpellChecker`, `pxIconUpdate` |
| `iconImage` | `string` | No | — | Image path (when `iconSource` is `image`) |
| `iconUrl` | `string` | No | — | External URL (when `iconSource` is `exturl`) |
| `iconProperty` | `string` | No | — | Property reference (when `iconSource` is `property`) |
| `iconStyle` | `string` | No | — | CSS class (when `iconSource` is `styleclass`) |
| `imageSource` | `string` | No | — | Button image source |
| `imageStyle` | `string` | No | — | CSS class for icon image |
| `imageProperty` | `string` | No | — | Property used as image |
| `captionPosition` | `string` | No | — | Position of caption relative to control |
| `placeholder` | `string` | No | `Select...` | Placeholder text for dropdowns |
| `displayWithReadOnlyFormat` | `boolean` | No | `true` | Use read-only format for an editable control |
| `charWidth` | `string` | No | — | Width of the control |
| `charWidthUnits` | `string` | No | — | Units of control width |
| `numberSymbol` | `string` | No | `currency` | Symbol used for numeric display |
| `currencyType` | `string` | No | `other` | Currency type |
| `otherCurrencySymbol` | `string` | No | — | Custom currency symbol |
| `currencySymbolPosition` | `string` | No | `start` | Position of the currency symbol |
| `displayCurrenctyAs` | `string` | No | `symbol` | How to display currency |
| `symbolValue` | `string` | No | — | Custom symbol value |
| `decimalPlaces` | `number` | No | — | Number of decimal places |
| `roundingMethod` | `string` | No | — | Rounding method (blank for none) |
| `hasSeparators` | `boolean` | No | `true` | Whether to show thousands separators |
| `numberScale` | `string` | No | — | Numeric scale |
| `negativeFormat` | `string` | No | — | Format for negative numbers |
| `negativeFormatStyle` | `string` | No | — | Style for negative format (`minusStyle` or `parensStyle`) |
| `autoPrepend` | `string` | No | — | Value to prepend to the number |
| `showValueAs` | `string` | No | `text` | Show true/false as `text` or an image |
| `trueLabel` | `string` | No | — | Text to display for `true` |
| `falseLabel` | `string` | No | — | Text to display for `false` |
| `trueImage` | `string` | No | — | Image to display for `true` |
| `falseImage` | `string` | No | — | Image to display for `false` |
| `orientation` | `string` | No | `vertical` | Orientation for `pxRadioButtons`. Enum: `vertical`, `horizontal` |
| `wrapAfter` | `integer` | No | `5` | Number of radio buttons per row before wrapping |
| `lightWeightAutoComplete` | `boolean` | No | — | Use lightweight autocomplete |
| `displayAsComboBox` | `boolean` | No | — | Display as combo box |
| `displayFullScreen` | `boolean` | No | — | Display in full-screen mode |
| `allowFreeFormInput` | `boolean` | No | — | Allow free-form text input |
| `dateTime` | `string` | No | — | Date/time picker scope. Enum: `auto`, `date`, `datetime`, `time` |
| `displayMode` | `string` | No | — | Display mode for date picker. Enum: `calendar`, `dropdowns`, `textinput`, `oneinput`, `twoinput`, `button` |
| `displayLongFormat` | `boolean` | No | — | Display using long format |
| `ignoreLocaleSettings` | `boolean` | No | — | Ignore locale-specific settings |
| `showReadOnlyFormatting` | `boolean` | No | — | Show read-only formatting |
| `calendarNavigation` | `string` | No | — | Whether to enable calendar navigation. Enum: `true`, `false` |
| `allowTextEntry` | `boolean` | No | — | If `true`, allow text entry of date; if `false`, use calendar icon only |

---

### NewRow

Represents a new row template for inserting rows into page lists or page groups.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `groups` | array of `Group` | No | Groups forming the new row template |
| `testID` | `string` | No | Unique identifier for testing (suffixed with `-R1`, `-R2`, etc.) |
| `listIndex` | `string` | No | Row number to replace when inserting into a PageList |
| `groupIndex` | `string` | No | Row key to replace when inserting into a PageGroup |

---

### NotificationsResponse

Response for the notifications endpoint.

> This model is defined as an empty object (`type: object`). Response structure depends on application configuration.

---

### Option

Represents a single option in a dropdown or radio button control.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `value` | `string` | No | `Critical` | Display value. For local lists, same as `key`; for prompt lists, may differ |
| `key` | `string` | No | `Critical` | The stored key value |

---

### Page

Represents a layout page within a case type (used for case creation and DX APIs).

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `pageID` | `string` | No | `Review` | Page identifier |
| `name` | `string` | No | `Review page` | Display name of the page |
| `appliesTo` | `string` | No | `MyCo-PAC-Work` | The class this page applies to |
| `caseTypeID` | `string` | No | `Purchase Request` | Case type identifier |
| `groups` | array of `TopPageGroup` | No | — | Top-level layout groups |
| `validationMessages` | `string` | No | `Unable to obtain credit score` | Non-field-specific validation errors (returned by refresh APIs) |

---

### Parameter

Describes a declared parameter on a data view.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | No | `AppName` | Parameter name |
| `description` | `string` | No | `Application name` | Human-readable description |
| `dataType` | `string` | No | `STRING` | Data type of the parameter |
| `required` | `string` | No | `false` | Whether the parameter is required (`"true"` or `"false"`) |
| `defaultValue` | `string` | No | `MyApp:07.10` | Default value if not supplied |

---

### Paragraph

Represents a paragraph (rich text) element within a layout group.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `visible` | `boolean` | No | `true` | Whether the paragraph is visible |
| `appliesTo` | `string` | No | — | The class this paragraph applies to |
| `paragraphID` | `string` | No | — | Paragraph rule identifier |
| `readOnly` | `boolean` | No | — | Should typically be `false` |
| `value` | `string` | No | `A paragraph about things` | HTML content of the paragraph (XSS-encoded) |

---

### QueryParams

Key-value pair for a query parameter within an `ActionProcess`.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | No | Static value |
| `name` | `string` | No | Parameter name |
| `valueReference` | `ValueReference` | No | Dynamic value from a property reference |

---

### RepeatRow

Configuration for row editing behavior in repeating layouts.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `rowEditing` | `string` | No | `masterDetail` | How rows are edited. Enum: `readOnly`, `row`, `masterDetail`. When `readOnly`, all fields are read-only |
| `editingInlineType` | `string` | No | `readWrite` | Available when `rowEditing` is `row`. Enum: `row` (click to edit), `readWrite` (inline editable) |

---

### Row

Represents a single data row in a table or repeating layout.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `groups` | array of `Group` | No | Groups forming the row |
| `testID` | `string` | No | Unique identifier for testing (appended with `-R1`, `-R2`, etc. for rows; `-1`, `-2`, etc. for RDL) |
| `groupIndex` | `string` | No | Text-based key for a row in a page group |

---

### SLA

Service Level Agreement timestamps for a case.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `stageSLAGoal` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | SLA goal for the current stage |
| `stageSLADeadline` | `string` (date-time) | No | `2015-02-05T18:00:44.443Z` | SLA deadline for the current stage |
| `overallSLAGoal` | `string` (date-time) | No | `2015-02-05T13:00:44.443Z` | Overall case SLA goal |
| `overallSLADeadline` | `string` (date-time) | No | `2015-02-05T18:00:44.443Z` | Overall case SLA deadline |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-SLA` | Pega internal class name |

---

### SocialGroupsResponse

Response for social group operations.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `groupID` | `string` | No | — | Group identifier |

---

### SpaceDetailsResponse

Full details for a single space, including members and hierarchy.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `owner` | `spaces-owner` | No | — | Owner information |
| `createdByName` | `string` | No | `Satish Raj Kumar P` | Display name of the creator |
| `lastUpdatedBy` | `string` | No | `rajks` | Operator ID of the last updater |
| `accessType` | `string` | No | `PUBLIC` | Access scope (`PUBLIC`, `PRIVATE`, etc.) |
| `memberCount` | `string` | No | `2` | Number of members |
| `description` | `string` | No | `Test23` | Space description |
| `spacehierarchy` | array of `spaces-spacehierarchy` | No | — | Hierarchical path of the space |
| `createdBy` | `string` | No | `rajks` | Operator ID of the creator |
| `createTime` | `string` | No | `20181227T133933.157 GMT` | Creation timestamp |
| `members` | array of `spaces-members` | No | — | List of space members |
| `name` | `string` | No | `Test23` | Space name |
| `ID` | `string` | No | `PEGASOCIAL-GROUP SPACE-2090` | Space identifier |
| `lastUpdatedByName` | `string` | No | `Satish Raj Kumar P` | Display name of the last updater |
| `lastUpdateTime` | `string` | No | `20181227T133933.167 GMT` | Last update timestamp |

---

### SpacePinsResponse

Response for pins within a space.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `entryCount` | `string` | No | `3` | Total number of pins |
| `pins` | array of `spaces-pins` | No | — | List of pin items |

---

### SpacesResponse

Top-level response for the spaces listing.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `spaces` | array of `spaces-groups` | No | List of spaces |

---

### Stage

Represents a stage in a case's lifecycle.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `PRIM1` | Stage identifier |
| `name` | `string` | No | `Stage 1` | Stage display name |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Stage` | Pega internal class name |

---

### StartingProcess

Describes a starting process (creation flow) for a case type.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `ID` | `string` | No | `pyStartCase` | Process identifier |
| `name` | `string` | No | `Add Expense` | Display name |
| `requiresFieldsToCreate` | `boolean` | No | `true` | Whether fields must be provided to initiate this process |
| `pxObjClass` | `string` | No | `Pega-API-CaseManagement-Process` | Pega internal class name |

---

### TopPageGroup

Top-level group within a `Page`, containing a layout.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `layout` | `Layout` | No | The layout for this top-level group |

---

### TopViewGroup

Top-level group within a `View`, containing either a layout or a nested view.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `layout` | `Layout` | No | The layout for this group |
| `view` | `View` | No | Nested view (alternative to layout) |

---

### URLReference

Represents a dynamic URL sourced from a property reference.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `reference` | `string` | No | Property path reference |
| `lastSavedValue` | `string` | No | The last saved value of the reference (XSS-encoded) |

---

### ValuePairs

Key-value pair for a setValue action within an `ActionProcess`.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | No | Static value to set |
| `name` | `string` | No | Property name |
| `valueReference` | `ValueReference` | No | Dynamic value from a property reference |

---

### ValueReference

Represents a dynamic value sourced from a Pega property reference.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `reference` | `string` | No | Property path reference |
| `lastSavedValue` | `string` | No | The last saved value (XSS-encoded to prevent cross-site scripting) |

---

### View

Represents a layout view within a case or action, used in DX (Digital Experience) APIs.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `reference` | `string` | No | `myEmbeddedPage` | Property path to the embedded page this view applies to |
| `validationMessages` | `string` | No | `Unable to obtain credit score` | Non-field-specific validation errors from refresh APIs |
| `viewID` | `string` | No | `CoreSummary` | View identifier |
| `name` | `string` | No | `Core fields summary` | Display name of the view |
| `appliesTo` | `string` | No | `MyCo-PAC-Work` | The class this view applies to |
| `visible` | `boolean` | No | `true` | Whether the view is visible |
| `groups` | array of `TopViewGroup` | No | — | Top-level layout groups |
| `title` | `string` | No | — | View title |
| `titleFormat` | `string` | No | — | Format applied to the title |
| `containerFormat` | `string` | No | — | Format applied to the container |
| `readOnly` | `boolean` | No | `true` | Whether the view is read-only |

---

### pageInstruction

Describes an instruction for manipulating an embedded page, page list, or page group.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `instruction` | `string` | No | `APPEND` | The operation to perform. Enum: `DELETE`, `REPLACE`, `UPDATE`, `APPEND`, `INSERT`, `MOVE`, `ADD`. `DELETE`, `REPLACE`, `UPDATE` apply to embedded pages, page lists, and page groups. `APPEND`, `INSERT`, `MOVE` apply to page lists only. `ADD` applies to page groups only |
| `target` | `string` | No | `myPageList` | Reference to the embedded page, page list, or page group. No leading dot required |
| `listIndex` | `integer` | No | `3` | Page list index for `DELETE`, `REPLACE`, `UPDATE`, `INSERT`, and `MOVE` instructions |
| `groupIndex` | `string` | No | `Customer` | Page group subscript for `ADD`, `DELETE`, `REPLACE`, and `UPDATE` instructions |
| `listMoveToIndex` | `integer` | No | `5` | Target index for the `MOVE` instruction |
| `content` | `object` | No | — | New content for the page. Required for all instructions except `DELETE` and `MOVE`. Instructions `REPLACE`, `ADD`, `APPEND`, and `INSERT` merge in the `pyDefault` data transform |

---

### postMessageRequest

The inner message payload for creating a message.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `context` | `string` | No | `MYCO-PAC-WORK C-27` | Context identifier (typically a case ID) |
| `message` | `string` | No | `I think that's a good idea` | Message text |

---

### spaces-groups

Represents a space entry in the spaces list.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `owner` | `spaces-owner` | No | — | Owner information |
| `accessType` | `string` | No | `PUBLIC` | Access scope |
| `memberCount` | `string` | No | `3` | Number of members |
| `name` | `string` | No | `test 26` | Space name |
| `description` | `string` | No | `test 26` | Space description |
| `ID` | `string` | No | `PEGASOCIAL-GROUP SPACE-2093` | Space identifier |

---

### spaces-members

Represents a member of a space.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | No | `Satish Raj Kumar P` | Display name |
| `ID` | `string` | No | `rajks` | Operator ID |
| `position` | `string` | No | `Principle Software Engineer` | Job title or position |
| `type` | `string` | No | `OWNER` | Membership type (e.g., `OWNER`, `MEMBER`) |
| `key` | `string` | No | `DATA-ADMIN-OPERATOR-ID RAJKS` | Full Pega key for the operator record |
| `status` | `string` | No | `APPROVED` | Membership status |

---

### spaces-owner

Represents the owner of a space.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `name` | `string` | No | `Satish Raj Kumar P` | Display name of the owner |
| `ID` | `string` | No | `rajks` | Operator ID of the owner |

---

### spaces-pins

Represents a pinned item within a space.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `pinType` | `string` | No | `Space` | Type of pinned item |
| `pinnedItem` | `string` | No | `PEGASOCIAL-GROUP SPACE-2092` | Identifier of the pinned item |
| `pinTypeID` | `string` | No | `PegaSocial-Group` | Class ID of the pinned item |
| `createdBy` | `string` | No | `ramcharan` | Operator who created the pin |
| `createTime` | `string` | No | `2019-01-09T13:48:51.000Z` | Pin creation timestamp |
| `name` | `string` | No | `Test 25` | Display name of the pinned item |
| `ID` | `string` | No | `LINK-ASSOCIATION-PIN PEGASOCIAL-GROUP SPACE-2092!PEGASOCIAL-GROUP SPACE-2090` | Pin link identifier |

---

### spaces-spacehierarchy

Represents a node in the hierarchical path of a space.

| Property | Type | Required | Example | Description |
|----------|------|----------|---------|-------------|
| `entryIndex` | `string` | No | `1` | Position in the hierarchy |
| `entryName` | `string` | No | `Test23` | Name of the hierarchy node |
| `entryID` | `string` | No | `PEGASOCIAL-GROUP SPACE-2090` | Identifier of the hierarchy node |

---

*End of documentation. Generated from Swagger 2.0 specification for PegaAPI v1.*
