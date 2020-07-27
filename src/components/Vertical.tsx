import React, { useState, useEffect } from "react";
import { Editor, EditorState, getDefaultKeyBinding } from "draft-js";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [arrow, setArrow] = useState("◇");

    useEffect(() => {
        const firstBlockKey = editorState.getSelection().getAnchorKey();
        const firstBlockElement = document.querySelector(`span[data-offset-key="${firstBlockKey}-0-0"]`);

        if (firstBlockElement) {
            const blankBlock = firstBlockElement.removeChild(firstBlockElement.firstChild as Node);
            firstBlockElement.insertAdjacentHTML("afterbegin", `<span id="char" data-text="true">${"Ｖ"}</span>`);
            const target = document.getElementById("target");
            const charHeight = target?.getBoundingClientRect().height || 16;
            firstBlockElement.insertAdjacentHTML("afterbegin", `<span id="line" data-text="true">${"Ｖ".repeat(200)}</span>`);
            const lineHeight = document.getElementById("line")?.getBoundingClientRect().height || 816;
            console.log(`${lineHeight} / ${charHeight} =`, lineHeight / charHeight);
            while (firstBlockElement.firstChild) {
                firstBlockElement.firstChild.remove();
            }
            firstBlockElement.appendChild(blankBlock);
        }
    }, []);

    const onEditorChange = (editor: EditorState) => {
        setEditorState(editor);
    };

    const setSelectionState = (d: number, k: string = editorState.getSelection().getAnchorKey()) => {
        const selection = editorState.getSelection();
        let { anchorOffset, focusOffset, anchorKey, focusKey } = JSON.parse(JSON.stringify(selection));
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

    const handleArrow = (e: React.KeyboardEvent) => {
        if (e.key.includes("Arrow")) {
            e.preventDefault();
            const currentSelection = editorState.getSelection();
            const currentKey = currentSelection.getAnchorKey();
            const currentOffset = currentSelection.getAnchorOffset();
            const currentContent = editorState.getCurrentContent();
            const blockLen = currentContent.getBlockForKey(currentKey).getLength();
            switch (e.key) {
                case "ArrowUp":
                    setArrow("↑");
                    if (currentOffset === 0) {
                        const beforeKey = currentContent.getKeyBefore(currentKey);
                        if (!beforeKey) return null;
                        const beforeLen = currentContent.getBlockForKey(beforeKey).getLength();
                        setSelectionState(beforeLen, beforeKey);
                        return null;
                    }
                    setSelectionState(currentOffset - 1);
                    return null;
                case "ArrowDown":
                    setArrow("↓");
                    if (currentOffset === blockLen) {
                        const afterKey = currentContent.getKeyAfter(currentKey);
                        if (!afterKey) return null;
                        setSelectionState(0, afterKey);
                        return null;
                    }
                    setSelectionState(currentOffset + 1);
                    return null;
                case "ArrowRight":
                    setArrow("→");
                    if (currentOffset > 20) {
                        setSelectionState(currentOffset - 20, currentKey);
                        return null;
                    }
                    // shift pre-block on caret as display anchoroffset
                    const beforeKey = currentContent.getKeyBefore(currentKey);
                    if (!beforeKey) return "move-selection-to-start-of-block";
                    const beforeLen = currentContent.getBlockForKey(beforeKey).getLength();
                    const beforeTargetLine = Math.floor(beforeLen / 20) * 20;
                    const beforeOffset = beforeTargetLine + Math.min(currentOffset % 20, beforeLen % 20);
                    setSelectionState(beforeOffset, beforeKey);
                    return null;
                case "ArrowLeft":
                    setArrow("←");
                    if (blockLen > 20) {
                        if (blockLen >= currentOffset + 20) {
                            setSelectionState(currentOffset + 20, currentKey);
                            return null;
                        } else {
                            // shift next-block on caret as display anchoroffset
                            const afterKey = currentContent.getKeyAfter(currentKey);
                            if (!afterKey) return "move-selection-to-end-of-block";
                            setSelectionState(currentOffset % 20, afterKey);
                            return null;
                        }
                    }
                    const afterKey = currentContent.getKeyAfter(currentKey);
                    if (!afterKey) return "move-selection-to-end-of-block";
                    const afterLen = currentContent.getBlockForKey(afterKey).getLength();
                    const afterOffset = afterLen < currentOffset ? afterLen : currentOffset;
                    setSelectionState(afterOffset, afterKey);
                    return null;
                default:
                    break;
            }
        }
        return getDefaultKeyBinding(e);
    };

    return (
        <div className="tate">
            <h1>
                <span className="ur">{arrow}</span> Draft.js sample
            </h1>
            <Editor editorState={editorState} onChange={onEditorChange} keyBindingFn={handleArrow} />
        </div>
    );
};

export default Vertical;
