import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorOptions, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo } from "react";
import { EditorView } from "prosemirror-view";
import Toolbar from "./toolbar";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import FontSize from "./extensions/font-size";
import TextDirection from "./extensions/text-direction";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import BulletList from "./extensions/bullet-list";
import OrderedList from "./extensions/ordered-list";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "./extensions/table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { ImageNode } from "./extensions/image";
import { Theme } from "@notesnook/theme";
import { AttachmentNode, AttachmentOptions } from "./extensions/attachment";
import { TaskListNode } from "./extensions/task-list";
import { TaskItemNode } from "./extensions/task-item";
import { Dropcursor } from "./extensions/drop-cursor";
import { SearchReplace } from "./extensions/search-replace";
import { EmbedNode } from "./extensions/embed";
import { CodeBlock } from "./extensions/code-block";
import { ListItem } from "./extensions/list-item";
import { Link } from "./extensions/link";
import {
  PortalProviderAPI,
  EventDispatcher,
  NodeViewSelectionNotifier,
} from "./extensions/react";
import { OutlineList } from "./extensions/outline-list";
import { OutlineListItem } from "./extensions/outline-list-item";
import { Table } from "./extensions/table";

EditorView.prototype.updateState = function updateState(state) {
  if (!(this as any).docView) return; // This prevents the matchesNode error on hot reloads
  (this as any).updateStateInner(state, this.state.plugins != state.plugins);
};

const useTiptap = (
  options: Partial<
    EditorOptions &
      AttachmentOptions & { theme: Theme; portalProviderAPI: PortalProviderAPI }
  > = {},
  deps?: React.DependencyList
) => {
  const {
    theme,
    onCreate,
    onUpdate,
    onDownloadAttachment,
    onOpenAttachmentPicker,
    portalProviderAPI,
    ...restOptions
  } = options;
  const eventDispatcher = useMemo(() => new EventDispatcher(), []);

  const defaultOptions = useMemo<Partial<EditorOptions>>(
    () => ({
      extensions: [
        NodeViewSelectionNotifier,
        SearchReplace,
        TextStyle,
        StarterKit.configure({
          dropcursor: false,
          codeBlock: false,
          listItem: false,
          orderedList: false,
          bulletList: false,
        }),
        Dropcursor.configure({
          class: "drop-cursor",
        }),
        CharacterCount,
        Underline,
        Subscript,
        Superscript,
        FontSize,
        TextDirection,
        FontFamily,
        BulletList,
        OrderedList,
        TaskItemNode.configure({ nested: true }),
        TaskListNode,
        Link,
        Table.configure({
          resizable: true,
          allowTableNodeSelection: true,
          cellMinWidth: 50,
        }),
        TableRow,
        TableCell,
        TableHeader,
        Highlight.configure({
          multicolor: true,
        }),
        CodeBlock,
        Color,
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "right", "center", "justify"],
          defaultAlignment: "left",
        }),
        Placeholder.configure({
          placeholder: "Start writing your note...",
        }),

        ImageNode,
        EmbedNode,
        AttachmentNode.configure({
          onDownloadAttachment,
          onOpenAttachmentPicker,
        }),
        OutlineListItem,
        OutlineList,
        ListItem,
      ],
      onCreate: ({ editor }) => {
        if (theme) {
          editor.storage.theme = theme;
        }
        if (portalProviderAPI)
          editor.storage.portalProviderAPI = portalProviderAPI;
        if (eventDispatcher) editor.storage.eventDispatcher = eventDispatcher;

        if (onCreate) onCreate({ editor });
      },
      onUpdate: ({ editor, transaction }) => {
        // a custom extension to transaction that indicates whether
        // this is an actual update or not.
        if ((transaction as any).skipUpdate) return;

        onUpdate?.({ editor, transaction });
      },
      injectCSS: false,
    }),
    [
      theme,
      onCreate,
      onUpdate,
      onDownloadAttachment,
      onOpenAttachmentPicker,
      portalProviderAPI,
      eventDispatcher,
    ]
  );

  const editor = useEditor({ ...defaultOptions, ...restOptions }, deps);

  /**
   * Add editor to global for use in React Native.
   */
  global.editor = editor;
  return editor;
};

export { useTiptap, Toolbar };
export * from "./extensions/react";
