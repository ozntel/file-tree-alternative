# Release Updates

## Version 2.6.0

-   Reveal Active File activates the Leaf

## Version 2.5.9

-   Fix for Pinned File Updates

## Version 2.5.8

-   Fix for selected folder color

## Version 2.5.7

-   Pin Functionality Fix

## Version 2.5.6

-   Style adjustment for folder and file (border and size)
-   Folder icon change handling fix
-   File icon display fix

## Version 2.5.5

-   Drag Manager Fix

## Version 2.5.4

-   Instant update after Exclude Folder Context Menu

## Version 2.5.3

-   Rename folder fix

## Version 2.5.2

-   Fix for event listener of bookmarks plugin

## Version 2.5.1

-   Exclude attachments folder, no matter where it is located
-   File List and Folder List obtain method improvement
-   Exclusions are respected within the "all" search
-   Folder children check correction to avoid having expand button enabled for folders not having children

## Version 2.5.0

-   Bookmark Plugin event listener fix and remove listener during unload of the plugin automatically

## Version 2.4.9

-   Bookmarks Plugin Soft Implementation - Users need to click on file or folder bookmarks using shift button

## Version 2.4.8

-   Rename Plugin to be compliant with Obsidian rules

## Version 2.4.7

-   Handle Rename for not .md files correctly

## Version 2.4.6

-   Divider Move Fix (which was broken because of drag manager fix)

## Version 2.4.5

-   Drag Manager Fix to display details during drag

## Version 2.4.4

-   Drag Fix for Files and Folders

## Version 2.4.3

-   Fix for Pinned Files
-   Fix for initial root folder and focused folder load from the local storage

## Version 2.4.2

-   #181 Fix for Reveal Active File, Fix for Event Listener Removal

## Version 2.4.1

-   Lazy load for File List to reduce Memory Consumption

## Version 2.4.0

-   Fix for #144 - Root folder doesn't get updated if the sort by is created time or updated time

## Version 2.3.9

-   Fix for file context menu
-   Default file or folder name (Untitled) during a file/folder creation

## Version 2.3.8

-   TFile to OZFile for less memory consumption and to break live updates
-   Event Handler fix for File Name Update for Subfolder View (Disappering Files Solution)
-   Further React Component Optimization

## Version 2.3.7

-   Minor fixes to adjust the plugin to the latest API
-   Rollup and Million for bundling
-   React Upgrade

## Version 2.3.6

-   Double Click Focus Feature
-   Focus now also activates the folder in the file pane

## Version 2.3.5

-   Folder Note Rename Handle - Rename also the file name under folder

## Version 2.3.4

-   Create a new note command

## Version 2.3.3

-   Reveal Leaf during initial vault load fix

## Version 2.3.2

-   Style settings plugin implementation

## Version 2.3.1

-   Default Evernote View Change

## Version 2.3.0

-   File sorting options enhancement

## Version 2.2.9

-   Vertical and Horizontal Evernote Views

## Version 2.2.8

-   #111 YAML Tags to be included in the tag search results

## Version 2.2.7

-   #123 Additional File Sorting Options
-   #122 Obsidian Internal Drag Manager usage

## Version 2.2.6

-   #77 Delete Confirmation Modal
-   Folder Count sort only if counts are enabled
-   Ctrl/Cmd key press capture during hover on file name

## Version 2.2.5

-   #124 Folders Expand fix in case Counts are not enabled

## Version 2.2.4

-   Open a file in a new tab or open to right options
-   Ctrl/Cmd + Click is to Open in a new tab
-   Ctrl/Cmd + Shift/Alt + Click is to Open to right

## Version 2.2.3

-   File delete issue solution if the file is in the view

## Version 2.2.2

-   Removing box shadow from file/folder headers

## Version 2.2.1

-   FIX: Moving file into the current folder view is captured now
-   NEW: Sorting option by Z to A
-   NEW: File names can be displayed by full path

## Version 2.2.0

-   Style changes (Mostly inspired by Prism Theme)

## Version 2.1.9

-   Option to open file tree view on vault start

## Version 2.1.8

-   #101 Folder delete option respects the plugin settings

## Version 2.1.7

-   #100 Folder Note Auto Creation
-   #105 Location Check during Long Press for Mobile

## Version 2.1.6

-   Reveal Active File reverted back to the original function
-   Long Press Event is triggered only by the touch event

## Version 2.1.5

-   Long press event for context menu on Mobile App

## Version 2.1.4

-   Adoption of reveal active file to Obsidian 0.15.0

## Version 2.1.3

-   New file button will not open the new file in the file tree leaf
-   New file button for folder context menu

## Version 2.1.2

-   Fix for opening a file from the file tree

## Version 2.1.1

-   #86 Correction - Moved folder doesn't disappear from the view

## Version 2.1.0

-   Mobile style optimization

## Version 2.0.9

-   Active File & Folder Corrections
-   Style Changes

## Version 2.0.8

-   Remove event listeners after unload

## Version 2.0.7

-   Vault Change Handlers performance optimization
-   State Handler optimization without additional checks within the vault
-   Small style and line corrections

## Version 2.0.6

-   Folder count bug correction
-   File name style

## Version 2.0.5

-   File Icons
-   Style Corrections

## Version 2.0.4

-   Styling corrections (Removing Obsidian default classes from HTML Elements)
-   Folder sorting options

## Version 2.0.3

-   Files with names including hashtag will be correctly opening
-   Preview on hover will requre Ctrl/Cmd

## Version 2.0.2

-   Open file tree pane command correction

## Version 2.0.1

-   Removal of react-spring dependency
-   Style corrections
-   Closed folders to not take place in DOM

## Version 2.0.0

-   You can use now Mouse Wheel button to open file in a new pane
-   There are now expand and collapse all buttons for folder view.
-   There is an additional button to create a folder in the root folder
-   Small style change for the line used for indenting children folders
-   There is an option to select what should happen to the file deleted (system trash, obsidian trash etc.)

## Version 1.8.9

-   File can be dragged to Editor and link to file will be inserted
-   File can be dragged into Folder view and dropped to move
-   Folder can be dragged into another Folder
-   Known Issue: drag needs to be initiated firstly out of the side pane. It doesn't work if the drag happens only within the file tree pane.

## Version 1.8.8

-   Count for open folders

## Version 1.8.7

-   Fixed Header during search correction

## Version 1.8.6

-   Removal of unnecessary space for mobile from the fixed header in file list

## Version 1.8.5

-   Style correction for mobile fixed top file header buttons

## Version 1.8.4

-   File sort options moved to file list pane
-   New sorting option with file size
-   Reveal active file is not turned on by default during installation

## Version 1.8.3

-   Folder note button in context menu

## Version 1.8.2

-   Files can be sorted by Created Date
-   Folder Note indicator style correction

## Version 1.8.1

-   Folder Note Functionality Implementation

## Version 1.8.0

-   Open in a new pane for Desktop

## Version 1.7.9

-   File view, file icon is not hidden behind fixed header solution

## Version 1.7.8

-   Overflow issue solution for Folder Name in File List Pane

## Version 1.7.7

-   Additional command for revealing the active file
-   Window custom event listener to trigger revealing active file outside of plugin

Sample:

```ts
let event = new CustomEvent('file-tree-alternative-reveal-file', {
    detail: {
        file: plugin.app.workspace.getActiveFile(),
    },
});
window.dispatchEvent(event);
```

## Version 1.7.6

-   Scroll correction for reveal active file

## Version 1.7.5

-   Reveal active file button
-   Icon update

## Version 1.7.4

-   #48 Bug Solution for Creating Folder

## Version 1.7.3

-   File creation custom settings

## Version 1.7.2

-   Mobile menu item correction

## Version 1.7.1

-   Sorting for pinned files
-   Open in a new pane button for mobile

## Version 1.7.0

-   Tooltip for the file list pane
-   Divider style change for easier grab

## Version 1.6.9

-   Removal of unnecessary padding within folder view

## Version 1.6.8

-   File Type correction within the file list
-   Folder Note Count Flex Correction
-   Folder Custom Nav File Tag

## Version 1.6.7

-   Fix for error happening after settings change
-   Custom Event for refreshing the file tree alternative. It solves blinking issue during settings change.

## Version 1.6.6

-   After clicking "Add to Excluded Folders", the view is refreshed immediately to make them effective
-   Excluded Folders are now taken into consideration within the file list
-   Memory Usage Improvements

## Version 1.6.5

-   Search Box Escape Listener
-   File Tree Divider Style Change

## Version 1.6.4

-   New File creation will automatically change the active file in file list pane
-   Icon update issue solution (Once children folders are removed)
-   Action removing all children folders will also remove the space reserved for the children folders

## Version 1.6.3

-   Memory usage improvement

## Version 1.6.2

-   Small Bug Fixes
-   Fontawesome icons are used from react-icons library

## Version 1.6.1

-   Reload File Tree button to make couple of settings effective without reloading the vault

## Version 1.6.0

-   Make a copy option manually included to file tree

## Version 1.5.9

-   Search files only under Focused Folder option

## Version 1.5.8

-   Remember the last focused folder

## Version 1.5.7

-   Custom Folder Icons
-   Fixed Header and buttons mobile style issue solution

## Version 1.5.6

-   Fixed Header and Buttons - Search Enabled Padding Solution
-   Local Storage Improvement

## Version 1.5.5

-   Consistent data is moved from Plugin Settings to Local Storage

## Version 1.5.4

-   Focus in and out to a specific folder in folder pane

## Version 1.5.3

-   Style Correction for Fixed Header and Buttons in the File Pane

## Version 1.5.2

-   Settings reorganization
-   Fixed Header and Buttons in the File Pane

## Version 1.5.1

-   Consistent Active Folder after relaunch of Obsidian or plugin

## Version 1.5.0

-   Leaf refresh after each settings change to make all changes effective

## Version 1.4.9

-   Additional button for toggling Files under Sub-Folders

## Version 1.4.8

-   The plugin allows to preview the files on hover within the file list

## Version 1.4.7

-   The plugin remembers the last position of the `divider` between `files` and `folders`

## Version 1.4.6

-   Sort files by `Last Update`

## Version 1.4.5

-   Ribbon Icon Hover Name Correction
-   Folder Name Color and Active Accent Corrections

## Version 1.4.4

-   Folder Move Context Menu if Core File Explorer disabled

## Version 1.4.3

-   Active Folder is highlighted in Folder Tree

## Version 1.4.2

-   Single view can be now easily resized, divider works to resize the panes

## Version 1.4.1

-   Style Changes, Smaller Workspace Tab Solution
-   Root Folder Context Menu for creating a new sub-folder

## Version 1.4.0

-   Active Folder Rename will correcly reflected in Single View

## Version 1.3.9

-   Correction of broken link for folders within the last update

## Version 1.3.8

-   Dropzone Height Correction for File Lists
-   Folder View Correction

## Version 1.3.7

-   Resizable Panes

## Version 1.3.6

-   Divider for single view

## Version 1.3.5

-   Default settings update

## Version 1.3.4

-   Evernote Like View Feature

## Version 1.3.3

-   Pinned Files and Open Folders states to be saved in Settings after each state change

## Version 1.3.2

-   Component Height Issue

## Version 1.3.1

-   Input focus issue
-   New File focus issue in the active leaf

## Version 1.3.0

-   Small style corrections

## Version 1.2.9

-   `Move file to` option to be available when core plugin `file-explorer` is disabled in `context-menu`

## Version 1.2.8

-   Search `all files with certain tag` under the vault feature using `tag:` syntaxt in the input box.
-   Settings `Ribbon Icon` description correction.

## Version 1.2.7

-   Search `all` files under the vault feature by using `all:` syntax in the input box

## Version 1.2.6

-   Clear button for search input - Issue #17

## Version 1.2.5

-   Search box `focus` on `input box` during toggle

## Version 1.2.4

-   `Search` feature within the file list view

## Version 1.2.3

-   `CSS` separated from `File Tree Component`

## Version 1.2.2

-   `oz-folder-name` class for folder names - Issue #11

## Version 1.2.1

-   Include files from the subfolders option in Settings

## Version 1.2.0

-   `Root Folder` show/hide option in plugin settings

## Version 1.1.9

-   folder note `count` class name change
-   add to `excluded folder` menu item is now available
-   folder component refactoring

## Version 1.1.8

-   Start from scroll top in `file` component
-   Refactoring of `file` component

## Version 1.1.7

-   Sorting algorithm correction
-   Folder `Click` event now responds to row, not only name span
-   Root `Folder` & `open state` correction
-   `CSS` cleanup
-   Dragging `className` correction

## Version 1.1.6

-   `[+] [-]` Icon Color Adjustment for themes
-   `Drag and Drop` to the Folder Tree
-   `Drag and Drop` style correction in Files List
-   `data-path` addition for folder div
-   `pinned files` save after each `pin files list` change
-   Removal of unnecessary state refresh in files view

## Version 1.1.5

-   `Drag & drop` external files into file list to add the files into the currently active folder path
-   Notes/Files Count Settings
-   `star/unstar` your files

## Version 1.1.4

-   Number of notes under a folder feature in the file tree

## Verson 1.1.3

-   Folder `Exclusion` by provided paths
-   `File Exclusion` by provided extensions

## Version 1.1.2

-   Remember Last Expanded Folders Feature
-   `Pinned Files` Feature

## Version 1.1.1

-   File Tree Dotted Border Color Correction
-   `oz-file-tree-header` color `--text-normal`
-   Folder, file sorting improvement

## Version 1.1.0

-   New Interface for the File Explorer

## Version 1.0.1

-   Corrections

## Version 1.0.0

-   Initial Release
