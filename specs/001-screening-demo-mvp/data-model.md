# Data Model: Pierwsze Demo MVP Screeningu

## Company

Represents a tenant/workspace in the demo.

**Fields**:

- `id`: stable identifier
- `name`: display name
- `slug`: short workspace identifier
- `createdAt`: creation timestamp

**Relationships**:

- Has many Users
- Has many Products

**Validation**:

- Name is required.
- Slug is unique.

## User

Represents a demo user.

**Fields**:

- `id`: stable identifier
- `displayName`: visible name
- `email`: demo login identifier
- `role`: `SUPER_ADMIN`, `COMPANY_ADMIN`, or `STANDARD_USER`
- `companyId`: assigned company for company-scoped roles
- `createdAt`: creation timestamp

**Relationships**:

- Belongs to Company when role is company-scoped

**Validation**:

- Email is unique.
- SuperAdministrator may have no company assignment.
- Company Admin and Standard User require a company assignment.

## Product

Represents a company-owned product or material submitted for screening.

**Fields**:

- `id`: stable identifier
- `companyId`: owning company
- `name`: product name
- `productType`: `SUBSTANCE`, `MIXTURE`, or `ARTICLE`
- `dataQualityStatus`: `READY`, `LIMITED`, or `INVALID`
- `createdAt`: creation timestamp

**Relationships**:

- Belongs to Company
- Has many Substances
- Has many Screening Results

**Validation**:

- Name and product type are required.
- Product is `LIMITED` if substance CAS/EC values are missing but a name exists.
- Product is `INVALID` if concentration cannot be interpreted.

## Substance

Represents a chemical ingredient or component in a product.

**Fields**:

- `id`: stable identifier
- `productId`: owning product
- `name`: substance name
- `casNumber`: optional CAS number
- `ecNumber`: optional EC number
- `concentrationPercent`: numeric concentration as percent

**Relationships**:

- Belongs to Product

**Validation**:

- Name is required when CAS and EC are both missing.
- Concentration must be numeric and greater than or equal to 0.
- CAS/EC may be missing in the demo but should be flagged as limited data quality.

## ReferenceList

Represents a global list used for screening.

**Fields**:

- `id`: stable identifier
- `name`: list name
- `description`: short display description
- `active`: whether list is available for screening
- `createdAt`: creation timestamp

**Relationships**:

- Has many Reference List Items
- Has many Screening Rules
- Has many Business Comments

**Validation**:

- Name is required.
- Active lists can be selected for screening.

## ReferenceListItem

Represents a substance or entry on a reference list.

**Fields**:

- `id`: stable identifier
- `referenceListId`: owning list
- `name`: listed substance name
- `casNumber`: optional CAS number
- `ecNumber`: optional EC number

**Relationships**:

- Belongs to ReferenceList

**Validation**:

- At least one of name, CAS, or EC is required.

## ScreeningRule

Represents a conditional rule attached to one reference list.

**Fields**:

- `id`: stable identifier
- `referenceListId`: owning list
- `name`: display name
- `active`: whether rule is evaluated
- `conditions`: first-demo condition set
- `outcomeStatus`: `match`, `no match`, or `verification required`

**Relationships**:

- Belongs to ReferenceList

**Validation**:

- Conditions in the first demo support `AND` over product type and concentration threshold.
- Default sample rule: product type is `MIXTURE` and concentration is greater than `0.1`.
- Exactly `0.1` does not satisfy a greater-than rule.

## BusinessComment

Represents a ready response shown with a result.

**Fields**:

- `id`: stable identifier
- `referenceListId`: related list
- `status`: result status trigger
- `text`: comment text

**Relationships**:

- Belongs to ReferenceList

**Validation**:

- Status and text are required.
- Text must not present the demo as final legal or chemical compliance advice.

## ScreeningResult

Represents the outcome of screening one product against one reference list.

**Fields**:

- `id`: stable identifier
- `productId`: screened product
- `referenceListId`: selected reference list
- `status`: `match`, `no match`, or `verification required`
- `matchedField`: `CAS`, `EC`, `NAME`, `RULE`, or `NONE`
- `reason`: human-readable reason
- `comment`: generated business comment snapshot
- `createdAt`: screening timestamp

**Relationships**:

- Belongs to Product
- Belongs to ReferenceList

**Validation**:

- Status is required.
- Reason is required.
- Comment is stored as a snapshot so the demo result remains explainable after comment changes.
