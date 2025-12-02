# Changelog

## [1.8.2] - 2025-12-02

### Changed
- refactor: update MMLite modal be dismissed by project

## [1.8.1] - 2025-12-01

### Added
- feat: enhance MMLite disclaimer logic and update modal content

## [1.8.0] - 2025-11-24

### Changed
- chore: update @weni/unnnic-system to version 3.11.0

## [1.7.0] - 2025-11-19

### Fixed
- Remove no longer needed extra flow verification
- Fix CSS overwrite with module federation

### Added
- Integrations API
- Enhance project store to include app UUIDs in channels and add wpp channels getter
- New broadcast linked to a channel

## [1.6.0] - 2025-11-13

### Fixed
- Fix recent sends loading

### Added
- Add unplugin-vue-components and remove manual Unnnic component declaration

### Changed
- Move API resources to a new 'flows' directory and update imports accordingly
- Optional flow selection

## [1.5.0] - 2025-10-28

### Added
- feat: enhance RecentSends component with polling logic

### Changed
- chore: update @weni/unnnic-system to version 3.5.0

## [1.4.0] - 2025-10-27

### Changed
- Refactor: ConfirmAndSend component
- chore: update dependencies
- test: enhance unit tests to remove console warnings

### Added
- feat: integrate Hotjar tracking

## [1.3.0] - 2025-10-24

### Added
- feat: handle language switch

### Fixed
- fix: display recent sends filters
- fix: channelType porperty and channel selection

### Changed
- feat: change sorting order from 'name' to 'date' in TemplateSelection
- refactor: GroupSelectionList layout to grid

## [1.2.1] - 2025-09-23

### Fixed
- refactor: replace toPercentage utility with toLocalizedFloat for cost formatting across components

## [1.2.0] - 2025-09-23

### Added
- feat: implement toPercentage utility for consistent cost and percentages
- feat: add channel and locale property to CreateBroadcastData

## [1.1.0] - 2025-09-19

### Added
- feat: implement redirect to new send page in RecentSends component
- feat: enhance TemplateSelectionPreview variable replacement

### Fixed
- fix: duplicates count
- fix: correct pagination logic in listAllGroups and update test comment
- fix: contact field project param
- fix: prevent header button to be displayed when template does not have a header
- fix: update project and token on remount
- fix: update success rate display in HomeBulkSend component
- fix: update home title
- fix: remove new template button
- fix: format cost value in GroupSelectionOverview
- fix: update accepted media formats for image and video

## [1.0.0] - 2025-09-18

### Added

- 🌱 Initial release.
