/**
 * Provide the namespace Store
 */
goog.provide('Computer');
goog.provide('Computer.Hardware');

/**
 * Map goog dependencies
 */
goog.addDependency('lib/Event.js', ['Event'], []);
goog.addDependency('lib/jquery.js', ['jquery'], []);
goog.addDependency('lib/jquery-ui.js', ['jquery-ui'], ['jquery']);
goog.addDependency('classes/fn.js', ['fn'], []);

goog.addDependency('components/system/System.js', ['Computer.System'], ['Computer.Hardware.Disk']);

goog.addDependency('components/process/Process.js', ['Computer.System.Process'], []);
goog.addDependency('components/program/Program.js', ['Computer.System.Program'], []);

goog.addDependency('components/shell/Output.js', ['Computer.System.Programs.Shell.Output'], []);
goog.addDependency('components/shell/AutoComplete.js', ['Computer.System.Programs.Shell.AutoComplete'], []);
goog.addDependency('components/shell/Shell.js', ['Computer.System.Programs.Shell'], ['Computer.System.Programs.Shell.AutoComplete', 'Computer.System.Programs.Shell.Output']);

goog.addDependency('classes/Notify.js', ['Computer.System.Notify'], []);
goog.addDependency('classes/Socket.js', ['Computer.System.Socket'], []);

goog.addDependency('components/hardware/Disk.js', ['Computer.Hardware.Disk'], ['Computer.Hardware.Disk.Folder']);
goog.addDependency('components/hardware/Folder.js', ['Computer.Hardware.Disk.Folder'], []);
goog.addDependency('components/hardware/Memory.js', ['Computer.Hardware.Memory'], []);

goog.require('fn');
goog.require('Event');
goog.require('jquery-ui');
goog.require('Computer.System');
goog.require('Computer.System.Programs.Shell');