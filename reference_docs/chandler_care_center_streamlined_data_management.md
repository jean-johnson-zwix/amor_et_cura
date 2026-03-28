# Chandler Care Center - Streamlined Data Management | Devpost - Opportunity Hack 2019
Acheivements
-------------
 Winner: 2nd Place - PayPal Prize
 Winner: 2nd place - Statement of Work (SOW) contract

Inspiration
-----------

The services that the **Chandler CARE Center** provide to the community are immensely important to our most vulnerable community members. Let's face it - data entry is not something many people enjoy, and it's an extremely repetitive process. There is no reason that this should be a tedious process for Chandler - rather it should be as efficient as possible so they can help as many children that they can.

And, because **Chandler CARE Center** relies on grants to continue their operation, report creation should be seamless, highly customizable and scalable, not inefficient. Increasing efficiency of **Chandler CARE Center** staff will enable them to focus their attention on those who need it most.

What it does
------------

**Chandler CARE Center** quite literally had a data problem. In 2018, they served 4,000 families (15,000 individuals), but relied on outdated database structures and entry. Entirely too much time was spent on data entry and report generation. We built a unified solution that relies on a single PostgresSQL database as the source of truth for all services, members and reporting. Utilizing a lightweight, cloud-based REST API, we're able to quickly and efficiently add new members, modify existing members and generate customized reports.

We wanted to remove as much redundant work from the staff as possible, so we also developed a self-service sign-in application. This web-based application allows those members who are already registered to simply enter their phone number, confirm their identity and select the services that they're visiting for. The application connects with the same PostgresSQL database, and automatically updates the service record for each individual.

Finally, we wanted to make it a seamless process for Chandler Care Center to transition their operations to our new system. To enable that, we built an import process that will load all member date from a CSV file into the database from their existing Access database, in addition to a robust export process should they decide to migrate the solution in the future.

How we built it
---------------

We took an API-first design strategy for this project. Once we decided what we were going to built, we quickly set out to define our domain objects in a consistent and clearly understood manner. Do do this, we utilized the OpenAPI Specification (formerly known as Swagger). By documenting every facet of our API prior to writing of code, we were able to ensure we have a clean and well conceived architecture.

The secondary benefit of this approach was our ability to utilize this specification (yaml file) to generate a templated SpringBoot project using the OpenAPI Springboot generator plug-in. Once the template was built, we simply had to map our API models to our repository and fill in the business logic. All generated code is kept in a separate Java module so we can make adjustments on the fly, re-generate and not have to do any re-work. As a bonus, we are able to generate API clients in nearly any modern programming language and have a living api spec that can be referenced alongside the API: [https://chandler-care-center.herokuapp.com/swagger-ui.html](https://chandler-care-center.herokuapp.com/swagger-ui.html).

Our back-end APIs are built using the SpringBoot Framework. We chose this framework due to the increased efficiency we get from various dependencies and plug-ins that are available. The front-end of the application was first wire-framed Figma. Once the team agreed upon the wireframes, Bill and Jesse began to build the front-end of the application using Angular 8 while Ty and Jake worked on the backend. A properly documented and well understood API permitted us to work in parallel.

Challenges we ran into
----------------------

The REST API ended up being far more complex than we originally anticipated due to the parent/child relationships. There is a significant amount of data that's possible to populate for a single record, and these records can be linked with other records in the household.

Reporting was its own challenge as there are essentially infinite ways to combine data points. We ultimately decided that starting with a service-level report made the most sense, as these are typically used for obtaining new grants and show an overview (no personally identifiable information) of the service as a whole. This approach ensured **Chandler CARE Center** employees had the most flexibility with their reporting.

Accomplishments that we're proud of
-----------------------------------

We've built a secure, totally functional solution in less than 36 hours, with no sleep. This includes a PostgresSQL database, functional REST API and import/export CSV capabilities. Our solution is hosted in the cloud (Heroku) and can be easily turned over to our client. They will incur very little hosting fees. We did setup a continuous integration pipeline but ran into issues with permissions in GitHub that prevented us utilizing it. Rather than focus on that issue, we opted to spend time building the application and plan to move to our own private GitHub and enable the pipeline in the future.

We believe that this solution will meet the needs of **Chandler CARE Center** and lays a sold foundation for future iteration and development. We're proud that we were able to build a fully-functional MVP, utilizing real data structures, functional APIs and an actual database.

With the help of our NPO contact, we were able to confidently identify the requirements and start building fairly quickly. We didn't have to spend a lot of timing in the discovery phase.

What we learned
---------------

We learned that capturing this data in an efficient and manageable way was not as easy as we first thought. There are complex relationships and considerations that must be considered. We spent quite a bit of time with Katie to understand what her issues were. Only after attempting to resolve those problems, did we understand why they have persisted. This was particularly difficult given our tight timeframe and lack of domain experience.

What's next for Chandler CARE Center Data Intake
------------------------------------------------

Our hope is that the MVP can be reviewed in detail with the **Chandler CARE Center** team. This will allow for rapid iteration and ultimately, deployment of the solution at a pre-determined time. The data structure is highly customizable, so we can tailor the experience to the changing needs of **Chandler CARE Center**.
---
GitHub Repo: https://github.com/2019-Arizona-Opportunity-Hack/Team9