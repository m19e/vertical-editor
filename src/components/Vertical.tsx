import React, { useState, useEffect } from "react";
import { Editor, EditorState, getDefaultKeyBinding, convertFromRaw, convertToRaw, Modifier } from "draft-js";
import { Scrollbars } from "react-custom-scrollbars";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [title, setTitle] = useState("");
    const [height, setHeight] = useState(20);
    const [text, setText] = useState("");

    useEffect(() => {
        const firstBlockKey = editorState.getSelection().getAnchorKey();
        const firstBlockElement = document.querySelector(`span[data-offset-key="${firstBlockKey}-0-0"]`);

        if (firstBlockElement) {
            const blankBlock = firstBlockElement.removeChild(firstBlockElement.firstChild as Node);
            firstBlockElement.insertAdjacentHTML("afterbegin", `<span id="char" data-text="true">${"Ｖ"}</span>`);
            const target = document.getElementById("char");
            const charHeight = target?.getBoundingClientRect().height || 16;
            firstBlockElement.insertAdjacentHTML("afterbegin", `<span id="line" data-text="true">${"Ｖ".repeat(200)}</span>`);
            const lineHeight = document.getElementById("line")?.getBoundingClientRect().height || 816;
            const h = Math.floor(lineHeight / charHeight);
            setHeight(h);
            console.log(`${lineHeight} / ${charHeight} = ${h}`);
            while (firstBlockElement.firstChild) {
                firstBlockElement.firstChild.remove();
            }
            firstBlockElement.appendChild(blankBlock);
        }

        const loadDraft = localStorage.getItem("myDraft");
        if (loadDraft) {
            const data = JSON.parse(loadDraft);
            const e = EditorState.createWithContent(convertFromRaw(JSON.parse(data.body)));
            const t = e.getCurrentContent().getPlainText();
            setTitle(data.title);
            setText(t);
            onEditorChange(e);
        }
    }, []);

    const [isSaved, setIsSaved] = useState(true);
    useEffect(() => {
        document.title = (isSaved ? "" : "*") + title;
    }, [title, isSaved]);

    useEffect(() => {
        setIsSaved(true);
    }, []);

    const saveDraft = (editor: EditorState) => {
        setIsSaved(true);
        const draftData = {
            title: title,
            body: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        };
        localStorage.setItem("myDraft", JSON.stringify(draftData));
    };

    const onEditorChange = (editor: EditorState) => {
        if (editor.getCurrentContent().getPlainText() !== text) {
            setIsSaved(false);
            setText(editor.getCurrentContent().getPlainText());
        }
        setTitle(editor.getCurrentContent().getBlockMap().first().getText().trim());
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
        // console.log(e.key);
        if (e.key === "Tab") {
            e.preventDefault();
            return null;
        }

        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            saveDraft(editorState);
            return null;
        }

        if (e.key.includes("Arrow")) {
            e.preventDefault();
            const currentSelection = editorState.getSelection();
            const currentOffset = currentSelection.getAnchorOffset();
            const currentContent = editorState.getCurrentContent();
            const currentKey = currentSelection.getAnchorKey();
            const blockLen = currentContent.getBlockForKey(currentKey).getLength();

            console.log(JSON.stringify(currentSelection, null, 4));

            switch (e.key) {
                case "ArrowUp":
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
                    if (currentOffset === blockLen) {
                        const afterKey = currentContent.getKeyAfter(currentKey);
                        if (!afterKey) return null;
                        setSelectionState(0, afterKey);
                        return null;
                    }
                    setSelectionState(currentOffset + 1);
                    return null;
                case "ArrowRight":
                    if (currentOffset > height) {
                        setSelectionState(currentOffset - height, currentKey);
                        return null;
                    }
                    // shift pre-block on caret as display anchoroffset
                    const beforeKey = currentContent.getKeyBefore(currentKey);
                    if (!beforeKey) return "move-selection-to-start-of-block";
                    const beforeLen = currentContent.getBlockForKey(beforeKey).getLength();
                    const beforeTargetLine = Math.floor(beforeLen / height) * height;
                    const beforeOffset = beforeTargetLine + Math.min(currentOffset % height, beforeLen % height);
                    setSelectionState(beforeOffset, beforeKey);
                    return null;
                case "ArrowLeft":
                    if (blockLen > height) {
                        if (blockLen >= currentOffset + height) {
                            setSelectionState(currentOffset + height, currentKey);
                            return null;
                        } else {
                            // shift next-block on caret as display anchoroffset
                            const afterKey = currentContent.getKeyAfter(currentKey);
                            if (!afterKey) return "move-selection-to-end-of-block";
                            const afterLen = currentContent.getBlockForKey(afterKey).getLength();
                            setSelectionState(Math.min(currentOffset % height, afterLen), afterKey);
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
        <div className="wrapper">
            <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={500}>
                <div className="tate">
                    <Editor editorState={editorState} onChange={onEditorChange} keyBindingFn={handleArrow} />
                </div>
            </Scrollbars>
        </div>
    );
};

export default Vertical;
