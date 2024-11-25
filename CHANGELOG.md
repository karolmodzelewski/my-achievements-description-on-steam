# Changelog

Both frontend and backend changes and the final version of the application will be documented in this file.

## 1.1.0 - 25.11.2024

- Update description
- Add ADULT_GAME category
- Change port to 3001
- Remove whitespaces after description is copied
- Change icons buttons positioning to be sticky instead of position absolute
- Minor improvements

## 1.0.0 - 21.02.2022

- Release 1.0.0 version

## 0.22.1 - 21.02.2022 [FE]

- Fix resizing icons on description
- Fix viewport scroller on game edition

## 0.22.0 - 20.02.2022 [BE]

- Change 'Add-game' module name to 'Game'
- Add endpoint to delete specific game

## 0.21.0 - 20.02.2022 [FE]

- Add option to delete specific game
- Add infobar when there is no data
- Change 'add-game' endpoint name to 'game'
- Fix setting initial categories when there is no data
- Small refactor

## 0.20.0 - 20.02.2022 [FE]

- Add snackbars

## 0.19.2 - 20.02.2022 [FE]

- Fix description copied data
- Fix reloading data after API call
- Fix missing hasNewAchievements property in Game interface
- Fix game edit

## 0.19.1 - 20.02.2022 [FE]

- Adjust frontend to backend changes
- Fix description, when there is no completed games or games with new achievements

## 0.19.0 - 20.02.2022 [BE]

- Refactor categories and games
- Simplify entities, delete needless code

## 0.18.1 - 18.02.2022 [BE]

- Fix POST categories endpoint

## 0.18.0 - 18.02.2022 [FE]

- Add view states to components
- Add reload description method after game is added
- Fix POST endpoint calls

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