# NMTSA-ScheduleApp | Devpost
Inspiration
-----------

Our non-profit organization, NMTSA, needed us to create an application that organized patient data and made it easy for their therapists to read. This problem hindered their ability to quickly and conveniently organize, which could then hinder their ability to provide therapy to the people that needed it. We wanted to make this process more efficient, making it possible for NMTSA to quickly organize and allocate its resources, better helping those in need.

What it does
------------

This application takes data from a csv file and organizes it in a tabular fashion. This allows people to quickly and easily see patient data, as well as allowing them to search through the data. For instance, the application allows people to search for people with a specific diagnosis, making it possible for potential therapists to quickly see what patients need what resources. Additionally, the application allows people to search for patients based on their availability, allowing them to organize and schedule their services.

How we built it
---------------

This application was built using the Spring framework. We used Enterprise Java as the language of choice. This allowed us to easily take in data from a file, as well as easily connect to a SQL database. We also used Apache Tomcat in order to deploy and test the application.

Challenges we ran into
----------------------

We ran into several issues with the SQL database. The database would sometimes not respond to SQL queries or would respond in a way that caused bugs later on in the application. For instance, the application at one point allowed someone to create a patient with no data, polluting the database with bad data.

We also ran into issues with GitHub which at one point required us to revert back to a previous commit, causing us to lose 2 hours of progress. We would also have issues with merge conflicts, although these were mainly due to a lack of communication.

Accomplishments that we're proud of
-----------------------------------

We were able to finish the main objective early, giving us plenty of time to polish the application and add CSS styling. We were also able to easily access the database, using MVC to connect the front-end to the back-end without conflicts. The table that came out of this was well organized, and the search methods produced appropriate results in a clear format.

What we learned
---------------

We learned a lot about the Spring framework as well as other libraries such as javax and bootstrap. We also learned how to better organize a major project, using UML diagrams and sequence charts in order to see what modules needed to be created and in what order they should be prioritized.

Outside of technical skills, we learned how to better interact with project leads and mentors. We learned how to ask technical questions to people who may not necessarily understand them, allowing the team and the lead to communicate what modules need to be created and what limitations may exist.

What's next for NMTSA-ScheduleApp
---------------------------------

Future updates could include proper encryption, which allows all patient data to be secure. We could also include proper admin validation, allowing our project lead to have full control over who can access patient data. Other updates could include a module that creates monthly logs or statements of people who have visited NMTSA, allowing the organization to see how many people use their services and how often.
---
GitHub Repo: https://github.com/2019-Arizona-Opportunity-Hack/Team-8.git