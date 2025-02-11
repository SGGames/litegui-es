import './css/index.css';

// import './utils/math.js';
import './utils/polyfill.js';

import LiteGUI from './core.js';
import { Area } from './components/area.js';
import { Split } from './components/split.js';
import { Console } from './components/console.js';
import { Dialog } from './components/dialog.js';
import { Dragger } from './components/dragger.js';
import { Inspector } from './components/inspector.js';
import { Menubar } from './components/menubar.js';
import { Panel } from './components/panel.js';
import { Table } from './components/table.js';
import { Tabs } from './components/tabs.js';
import { Tree } from './components/tree.js';
import { Button } from './components/button.js';
import { SearchBox } from './components/searchBox.js';
import { ContextMenu } from './components/contextMenu.js';
import { Slider } from './components/slider.js';
import { LineEditor } from './components/lineEditor.js';
import { List } from './components/list.js';
import { Checkbox } from './components/checkbox.js';
import { ComplexList } from './components/complexList.js';
import { ColorPicker } from './components/colorPicker.js';

LiteGUI.Area = Area;
LiteGUI.Split = Split;
LiteGUI.Console = Console;
LiteGUI.Dialog = Dialog;
LiteGUI.Dragger = Dragger;
LiteGUI.Inspector = Inspector;
LiteGUI.Menubar = Menubar;
LiteGUI.Panel = Panel;
LiteGUI.Table = Table;
LiteGUI.Tabs = Tabs;
LiteGUI.Tree = Tree;
LiteGUI.Button = Button;
LiteGUI.SearchBox = SearchBox;
LiteGUI.ContextMenu = ContextMenu;
LiteGUI.Slider = Slider;
LiteGUI.LineEditor = LineEditor;
LiteGUI.List = List;
LiteGUI.Checkbox = Checkbox;
LiteGUI.ComplexList = ComplexList;
LiteGUI.ColorPicker = ColorPicker;

export default LiteGUI;