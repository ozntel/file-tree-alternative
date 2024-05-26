# Obsidian File Tree Alternative Plugin

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/ozntel/file-tree-alternative?style=for-the-badge)
![GitHub all releases](https://img.shields.io/github/downloads/ozntel/file-tree-alternative/total?style=for-the-badge)

The default file explorer of Obsidian has all files and folders in a single view. The File Tree Alternative plugin helps you to have separate views for folders and files.

The plugin is updated quiet regularly. You can see the details of each release using the following link [Release Updates](https://github.com/ozntel/file-tree-alternative/blob/main/Releases.md)

## Plugin Features

### General

-   You can use `Evernote` view, which shows folders and file list at the same time. Or simply turn it off to have separate views. The plugin supports splitting the view `horizontally` or `vertically`. Make sure that you adjust the plugin settings accordingly.
-   You can use `Ribbon Icon` to activate the `File Tree Leaf` in case you close by mistake. You can turn off `ribbon icon` from the plugin settings. It will only work if you closed the plugin view accidentaly or on purpose to build it back.

### Folder Pane Features

-   You can see the `number of notes` under each folder within the `folders` view. You have an option if you want to see the number for notes or `number of all files`. You can also turn this function off completely to remove counts from the display.

    <img src="https://raw.githubusercontent.com/ozntel/file-tree-alternative/main/images/number-of-notes.png" width="180"></img>

-   You can also `focus in and out` to a certain folder, which will help you to save space in the folder pane by either double clicking the folder name or using the context menu items:

    <img src="https://raw.githubusercontent.com/ozntel/file-tree-alternative/main/images/focus-in-folder.png" width="180"></img>

    <img src="https://raw.githubusercontent.com/ozntel/file-tree-alternative/main/images/focus-out-from-folder.png" width="180"></img>

Double Clicking again on the focused folder name will move focus to the parent folder.

-   The plugin remembers `last expanded folders` and `last focused folder` state to load for the following session in case you relaunch your vault.
-   You can define certain `folder paths` in plugin settings to exclude from main folder list. All subfolders are going to be excluded, as well.
-   You can turn on/off `root folder` within the file tree.
-   You can customize the `folder icons`. Check the available options from plugin settings:

    <img src="https://raw.githubusercontent.com/ozntel/file-tree-alternative/main/images/folder-icons.png" width="300"></img>

-   You can expand/collapse all folders using the navigation buttons on the top.

### File List Pane Features

-   The plugin lists all files including the `files under sub-folders`. You can turn off this option from plugin settings if you want to see only the files under the folder you selected. You can also turn on `toggle button` from the plugin settings and it'll include an additional button (looks like an eye) to toggle `files under sub-folders`. You can also toggle viewing direct or all files under a folder.
-   The plugin allows you to `Pin` your favorite files to the top. They are saved for the following sessions.
-   You can define certain `file extensions` in plugin settings to exclude from listing in file explorer.
-   You can drop `external files` into file list to add the files into current active folder path.
-   You can turn on `Search` feature from plugin settings to filter files with their names.
    -   You can use `all:` syntax in search box to search files from all folders rather than the active folder.
    -   You can use `tag:` syntax in search box to search files with tag. It will show all files with full or partial match.
-   You can fix the buttons and the header on the top of the file list. Not all themes are compatible with this option. You might need to add custom CSS to use this option effectively:

    <img src="https://raw.githubusercontent.com/ozntel/file-tree-alternative/main/images/fixed-top-files.png" width="180"></img>

-   You can sort your files depending on your needs. Current options are `File Name`, `File Size`, `Creation Time` and `Update Time`. You can sort from both sides using `Reverse Order` button.

# Style Settings

As of version 2.3.2, the plugin supports Custom Style Setings. To be able to use it, you need to install <a href="https://github.com/mgmeyers/obsidian-style-settings">Style Settings</a> plugin. You can customize the size, colors etc.

## Sample Images

-   Single Folder View:

      <img src="https://github.com/ozntel/file-tree-alternative/raw/main/images/folders-view.png" style="width: 400px;" />

-   Pin to Top:

      <img src="https://github.com/ozntel/file-tree-alternative/raw/main/images/files-pinned.png" style="width: 400px;" />

## Sample Record

<a href="https://youtu.be/fbz8IZtXuUE" target=“_blank”>
    <img src="https://github.com/ozntel/file-tree-alternative/raw/main/images/obsidian-plugin.png" style="width: 300px;" /> 
</a>

You can also checkout the Youtube video created by Antone Heyward explaining the functionalities of the plugin:
<a href="https://youtu.be/KBzE_BT0rtQ" target="_blank">Enhance The File Explorer File Tree Alternative Plugin</a>

## Contact

If you have any issue or you have any suggestion, please feel free to reach me out directly using contact page of my website [ozan.pl/contact/](https://www.ozan.pl/contact/) or directly to <me@ozan.pl>.

## Support

If you are enjoying the plugin then you can support my work and enthusiasm by buying me a coffee:

<a href='https://ko-fi.com/L3L356V6Q' target='_blank'>
    <img height='48' style='border:0px;height:48px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' />
</a>
