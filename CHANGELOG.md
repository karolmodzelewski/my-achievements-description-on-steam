# Changelog

Both frontend and backend changes and the final version of the application will be documented in this file.

## 0.17.3 - 18.02.2022 [FE]

- Add missing id parameters to mock data

## 0.17.2 - 18.02.2022 [BE]

- Fix categories endpoint returning data in wrong format

## 0.17.1 - 18.02.2022 [BE]

- Fix sort data in description

## 0.17.0 - 16.02.2022 [BE]

- Create Description endpoint and handle its functionality

## 0.16.1 - 16.02.2022 [FE]

- Add missing 'New achievements' value to 'Add game' form
- Adjust 'Add game' form to backend changes

## 0.16.0 - 16.02.2022 [BE]

- Create Add game endpoint
- Handle completed games and games with new achievements

## 0.15.1 - 15.02.2022 [BE]

- Add global 'api' prefix to requests

## 0.15.0 - 15.02.2022 [FE]

- Add proxy to backend
- Add environments
- Add global interceptor to handle 'api' prefix in requests

## 0.14.0 - 15.02.2022 [BE]

- Add categories

## 0.13.0 - 12.02.2022 [BE]

- Configure environments
- Add validation schema config

## 0.12.0 - 12.02.2022 [BE]

- Add joi library
- Update outdated packages

## 0.11.0 - 11.02.2022 [BE]

- Init backend project and basic configuration

## 0.10.0 - 11.02.2022 [FE]

- Add favicon
- Minor refactor

## 0.9.0 - 30.01.2022 [FE]

- Adjust views to mobile devices

## 0.8.1 - 29.01.2022 [FE]

- Lint and format application

## 0.8.0 - 29.01.2022 [FE]

- Add ViewportScroller to 'Add categories' and 'Add game' components
- Add missing ChangeDetectionStrategy.OnPush

## 0.7.0 - 29.01.2022 [FE]

- Add edition mode for specific game
- Change description data model
- Fix getting data from description endpoint on description component

## 0.6.0 - 29.01.2022 [FE]

- Create 'Add game' view and logic

## 0.5.0 - 29.01.2022 [FE]

- Add custom scrollbar for description component

## 0.4.2 - 29.01.2022 [FE]

- Change Omit<Category, 'amount'> to optional 'amount' parameter in 'Category' interface

## 0.4.1 - 29.01.2022 [FE]

- Restore categories GET endpoint
- Fix invalid description presentation

## 0.4.0 - 29.01.2022 [FE]

- Add missing validations to 'Add categories' form
- Add 'x' icon to handle reset of specific input field in 'Add categories' form

## 0.3.0 - 28.01.2022 [FE]

- Create 'Add categories' view and logic
- Add ignore *html rule to prettier
- Improve colors and margins in app
- Add states standalone components
- Delete categories endpoint and its data from mocks

## 0.2.0 - 27.01.2022 [FE]

- Add section-heading component
- Prettify the whole application

## 0.1.0 - 26.01.2022 [FE]

- Add main-page module with lazy loading
- Add various components and utils
- Add description component
- Add mocks
- Add necessary enums and interfaces

## 0.0.0 - 26.01.2022 [FE]

- Init frontend project