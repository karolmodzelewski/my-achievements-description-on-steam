# Changelog

Both frontend and backend changes and the final version of the application will be documented in this file.

## 1.10.0 - 13.11.2026

- Allow changing the order of main, length and difficulty categories with drag & drop

## 1.9.0 - 12.11.2026

- Replace predefined categories with user-defined main, length and difficulty categories stored on backend
- Rename 'Add categories' section to 'Manage categories'
- Rebuild 'Manage categories' section to a form per kind: category name, description, icon name and, for main categories only, an optional 'Hide games' checkbox, with adding and removing categories like groups
- Keep 100% as a fixed category of its own kind in a separate '100% category' section, with only its icon editable
- Replace the Adult game logic with 'Hide games'
- Confirm deleting a saved category and unassign it from games after saving
- Fix group buttons sticking out of the Manage game form on mobile
- Fix GameService unit test missing the GameGroup repository

## 1.8.0 - 11.11.2026

- Add a description size counter next to the Description heading, measured the way Steam limits descriptions (8000 bytes of UTF-8, line breaks counting as 2), colored red when the limit is reached
- Highlight the part of the description Steam would cut off, from the exact cut-off character, without trimming the copied description or blocking the copy

## 1.7.0 - 10.11.2026

- Add a confirmation dialog before deleting a game or group

## 1.6.1 - 10.11.2026

- Simplify media queries syntax

## 1.6.0 - 10.11.2026

- Replace the empty (...) option in Length and Difficulty dropdowns with a clear button to remove selected value, consistent with game and group names

## 1.5.1 - 10.11.2026

- Trim game, group and category texts everywhere, so the copied description has no leading or trailing spaces
- Block blank game and group names in the form and on backend
- Improve error messages when saving a game fails due to blank names

## 1.5.0 - 09.11.2026

- Hide categories with 0 games: presented as hidden information in the application and never copied

## 1.4.0 - 09.11.2026

- Add Steam achievement groups (DLCs): Base Game and DLC groups in the Manage game section, each with its own New achievements checkbox
- Count every completed group as a finished game and split COMPLETED and NEW ACHIEVEMENTS headings into GAMES and GROUPS amounts, calculated on backend
- Present completed groups below their game as hidden information, never copied, and groups with new achievements as separate entries
- Rename adult game styling to generic hidden information
- Show the adult games summary (... and (N) games) in the application description, not only in the copied one
- Swap Cancel editing and Edit game buttons

## 1.3.0 - 09.11.2026

- Add AAA pattern and data-testId selectors to unit tests, remove broken e2e test
- Add Cancel editing button and change the submit button text to 'Edit game' while editing
- Bump dependencies to the newest compatible versions
- Fix copied description ending with whitespaces
- Fix description endpoint failing when a category is missing in the database
- Fix duplicated game after renaming it during edition
- Fix games with all categories selected being rejected and add validation of the categories request
- Fix icon buttons sizes and description layout shifts
- Fix new categories not being configurable when some categories are already saved
- Fix production dev server warnings and lint-staged formatting all files
- Fix snackbar colors
- Improve accessibility: icon buttons with labels, labelled checkboxes, heading order, ARIA states
- Rename 'Add game' section to 'Manage game'
- Replace reactive forms with signal forms and load main page data with httpResource
- Show game name clear button only when the name is provided
- Update and delete games by id (PUT/DELETE /game/:id)
- Use standalone Material imports, default OnPush change detection and type inference
- Remove Destroyable util and switch to takeUntilDestroyed

## 1.2.0 - 02.11.2026

- Update frontend to Angular 22 and backend to NestJS 12, bump all dependencies to the newest versions
- Switch frontend to standalone components, signals and zoneless change detection
- Replace Karma and Jasmine with Vitest
- Migrate ESLint configs to flat configs with stricter rules and fix all related issues
- Fix unit tests

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
- Add ignore \*html rule to prettier
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
