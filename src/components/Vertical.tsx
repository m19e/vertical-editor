import React, { useState, useEffect } from "react";
import { Editor, EditorState, getDefaultKeyBinding, convertFromRaw, convertToRaw } from "draft-js";
import { Scrollbars } from "react-custom-scrollbars";
import { AppBar, Button, ButtonGroup } from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [height, setHeight] = useState(32);
    const [fontSize, setFontSize] = useState(24);

    useEffect(() => {
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
        const firstBlockText = editor.getCurrentContent().getBlockMap().first().getText().trim();
        setTitle(firstBlockText || "無題");
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

    const handleKey = (e: React.KeyboardEvent) => {
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
                <div className="tate" style={{ fontSize: fontSize + "px", height: height * fontSize + "px" }}>
                    <Editor editorState={editorState} onChange={onEditorChange} keyBindingFn={handleKey} />
                </div>
            </Scrollbars>
            <AppBar position="fixed" color="inherit" style={{ top: "auto", bottom: 0 }} className="appbar">
                <div style={{ margin: "auto" }}>
                    <ButtonGroup className="bgroup" orientation="vertical" color="inherit" aria-label="vertical contained primary button group" variant="text">
                        <Button size="small" variant="text">
                            <ExpandLess className="control" />
                        </Button>
                        <span style={{ textAlign: "center" }}>行間 {2}</span>
                        <Button size="small" variant="text">
                            <ExpandMore className="control" />
                        </Button>
                    </ButtonGroup>
                    <ButtonGroup className="bgroup" orientation="vertical" color="inherit" aria-label="vertical contained primary button group" variant="text">
                        {fontSize < 50 ? (
                            <Button size="small" variant="text" onClick={() => setFontSize(fontSize + 4)}>
                                <ExpandLess className="control" />
                            </Button>
                        ) : (
                            <Button size="small" variant="text" disabled={true}>
                                <ExpandLess className="control" />
                            </Button>
                        )}
                        <span style={{ textAlign: "center" }}>文字サイズ {fontSize}</span>
                        {fontSize > 8 ? (
                            <Button size="small" variant="text" onClick={() => setFontSize(fontSize - 4)}>
                                <ExpandMore className="control" />
                            </Button>
                        ) : (
                            <Button size="small" variant="text" disabled={true}>
                                <ExpandMore className="control" />
                            </Button>
                        )}
                    </ButtonGroup>
                    <ButtonGroup className="bgroup" orientation="vertical" color="inherit" aria-label="vertical contained primary button group" variant="text">
                        <Button size="small" variant="text" onClick={() => setHeight(height + 2)}>
                            <ExpandLess className="control" />
                        </Button>
                        <span style={{ textAlign: "center" }}>字数 {height}</span>
                        <Button size="small" variant="text" onClick={() => setHeight(height - 2)}>
                            <ExpandMore className="control" />
                        </Button>
                    </ButtonGroup>
                </div>
            </AppBar>
        </div>
    );
};

export default Vertical;
