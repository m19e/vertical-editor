import React, { useState } from "react";
import { Editor, EditorState, getDefaultKeyBinding } from "draft-js";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );
    const [arrow, setArrow] = useState("◇");

    const handleArrow = (e: React.KeyboardEvent) => {
        if (e.key.includes("Arrow")) {
            e.preventDefault();
            const currentKey = editorState.getSelection().getAnchorKey();
            switch (e.key) {
                case "ArrowUp":
                    setArrow("↑");
                    setSelectionState(-1);
                    break;
                case "ArrowDown":
                    setArrow("↓");
                    setSelectionState(1);
                    break;
                case "ArrowRight":
                    setArrow("→");
                    const before = editorState
                        .getCurrentContent()
                        .getKeyBefore(currentKey);
                    if (!before) return "move-selection-to-start-of-block";
                    setSelectionState(0, before);
                    break;
                case "ArrowLeft":
                    setArrow("←");
                    const after = editorState
                        .getCurrentContent()
                        .getKeyAfter(currentKey);
                    if (!after) return "move-selection-to-end-of-block";
                    setSelectionState(0, after);
                    break;
                default:
                    break;
            }
        }
        return getDefaultKeyBinding(e);
    };

    const onEditorChange = (editor: EditorState) => {
        setEditorState(editor);
    };

    const setSelectionState = (
        d: number,
        k: string = editorState.getSelection().getAnchorKey()
    ) => {
        const selection = editorState.getSelection();
        // console.log(JSON.parse(JSON.stringify(selection)));
        let { anchorOffset, focusOffset, anchorKey, focusKey } = JSON.parse(
            JSON.stringify(selection)
        );
        anchorOffset = anchorOffset + d;
        focusOffset = focusOffset + d;
        anchorKey = k;
        focusKey = k;
        const newSelection = selection.merge({
            anchorOffset,
            focusOffset,
            anchorKey,
            focusKey,
        });
        const newEditor = EditorState.forceSelection(editorState, newSelection);
        onEditorChange(newEditor);
    };

    const hardControllSelection = (e: React.KeyboardEvent) => {
        const ta = window.getSelection();
        const start: number = ta?.anchorOffset || 0;
        if (e.key === "ArrowUp") {
            if (start - 1 < 0) return null;
            ta?.setPosition(ta.anchorNode, start - 1);
        }
        if (e.key === "ArrowDown") {
            if (start + 1 > (ta?.anchorNode?.textContent?.length || 0))
                return null;
            ta?.setPosition(ta.anchorNode, start + 1);
        }
        if (e.key === "ArrowRight") {
            return "move-selection-to-start-of-block";
        }
        if (e.key === "ArrowLeft") {
            return "move-selection-to-end-of-block";
        }
        console.log(JSON.stringify(window.getSelection()?.anchorOffset));
    };

    return (
        <div className="tate">
            <h1><span className="ur">{arrow}</span> Draft.js sample</h1>
            <Editor
                editorState={editorState}
                onChange={onEditorChange}
                keyBindingFn={handleArrow}
            />
        </div>
    );
};

export default Vertical;
