import React, { useState } from "react";
import {
    Editor,
    EditorState,
    getDefaultKeyBinding,
    convertToRaw,
} from "draft-js";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );
    const [arrow, setArrow] = useState("◇");

    const handleArrow = (e: React.KeyboardEvent) => {
        const currentSelection = editorState.getSelection();
        const currentKey = currentSelection.getAnchorKey();
        const currentContent = editorState.getCurrentContent();
        const blockLen = currentContent.getBlockForKey(currentKey).getLength();
        if (e.key.includes("Arrow")) {
            e.preventDefault();
            // console.log(JSON.stringify(convertToRaw(currentContent), null, 4));
            switch (e.key) {
                case "ArrowUp":
                    setArrow("↑");
                    setSelectionState(currentSelection.getAnchorOffset() - 1);
                    return null;
                case "ArrowDown":
                    setArrow("↓");
                    setSelectionState(currentSelection.getAnchorOffset() + 1);
                    return null;
                case "ArrowRight":
                    setArrow("→");
                    if (blockLen > 20) {
                        if (currentSelection.getAnchorOffset() - 20 > 0) {
                            setSelectionState(
                                currentSelection.getAnchorOffset() - 20,
                                currentKey
                            );
                            return null;
                        } else {
                            // shift pre-block on caret as display anchoroffset
                            const beforeKey = currentContent.getKeyBefore(
                                currentKey
                            );
                            if (!beforeKey) {
                                return "move-selection-to-start-of-block";
                            }
                            const beforeOffset =
                                Math.floor(
                                    currentContent
                                        .getBlockForKey(beforeKey)
                                        .getLength() / 20
                                ) *
                                    20 +
                                (currentSelection.getAnchorOffset() % 20);
                            setSelectionState(beforeOffset, beforeKey);
                            return null;
                        }
                    }

                    const beforeKey = currentContent.getKeyBefore(currentKey);
                    if (!beforeKey) return "move-selection-to-start-of-block";
                    const beforeLen = currentContent
                        .getBlockForKey(beforeKey)
                        .getLength();
                    const beforeOffset =
                        beforeLen < currentSelection.getAnchorOffset()
                            ? beforeLen
                            : currentSelection.getAnchorOffset();
                    setSelectionState(beforeOffset, beforeKey);
                    return null;
                case "ArrowLeft":
                    setArrow("←");
                    if (blockLen > 20) {
                        if (
                            blockLen >
                            currentSelection.getAnchorOffset() + 20
                        ) {
                            setSelectionState(
                                currentSelection.getAnchorOffset() + 20,
                                currentKey
                            );
                            return null;
                        } else {
                            // shift next-block on caret as display anchoroffset
                            const afterKey = currentContent.getKeyAfter(
                                currentKey
                            );
                            if (!afterKey)
                                return "move-selection-to-end-of-block";

                            setSelectionState(
                                currentSelection.getAnchorOffset() % 20,
                                afterKey
                            );
                            return null;
                        }
                    }
                    const afterKey = currentContent.getKeyAfter(currentKey);
                    if (!afterKey) return "move-selection-to-end-of-block";
                    const afterLen = currentContent
                        .getBlockForKey(afterKey)
                        .getLength();
                    const afterOffset =
                        afterLen < currentSelection.getAnchorOffset()
                            ? afterLen
                            : currentSelection.getAnchorOffset();
                    setSelectionState(afterOffset, afterKey);
                    return null;
                default:
                    break;
            }
        }
        // if (
        //     e.key !== "Backspace" &&
        //     currentContent.getBlockForKey(currentKey).getLength() > 15
        // ) {
        //     console.log("fire");
        //     setSelectionState(15, currentKey);
        //     return "split-block";
        // }
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
        let { anchorOffset, focusOffset, anchorKey, focusKey } = JSON.parse(
            JSON.stringify(selection)
        );
        anchorOffset = d;
        focusOffset = d;
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
            <h1>
                <span className="ur">{arrow}</span> Draft.js sample
            </h1>
            <Editor
                editorState={editorState}
                onChange={onEditorChange}
                keyBindingFn={handleArrow}
            />
        </div>
    );
};

export default Vertical;
