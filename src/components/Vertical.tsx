import React, { useState, useEffect, createRef, CSSProperties } from "react";
import { Editor, EditorState, ContentState, getDefaultKeyBinding, convertFromRaw, convertToRaw } from "draft-js";
import { Scrollbars } from "react-custom-scrollbars";
import { AppBar, Button, ButtonGroup, Box, Fade } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import "./Vertical.css";

interface StylesProps {
    isMincho: boolean;
}

const useStyles = makeStyles<Theme, StylesProps>((theme: Theme) =>
    createStyles({
        root: {
            width: "100%",
            height: "100%",
            fontFamily: ({ isMincho }) =>
                isMincho
                    ? `"游明朝体", "Yu Mincho", YuMincho, "Times New Roman", TimesNewRoman, serif`
                    : `"游ゴシック体", "Yu Gothic", YuGothic, Arial, sans-serif`,
            fontWeight: ({ isMincho }) => (isMincho ? "normal" : 500),
        },
        textCenter: {
            textAlign: "center",
        },
    })
);

const styles: { [key: string]: CSSProperties } = {
    scroll: {
        position: "absolute",
        bottom: "13%",
        height: "85%",
        width: "95%",
    },
};

const Vertical = (): JSX.Element => {
    // const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [editorState, setEditorState] = useState(() => EditorState.createWithContent(ContentState.createFromText("ここに本文を入力")));
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [height, setHeight] = useState(30);
    const [fontSize, setFontSize] = useState(24);

    const scrollbars: React.RefObject<Scrollbars> = createRef();

    const [isMincho, setIsMincho] = useState(true);
    const [open, setOpen] = useState(false);
    const classes = useStyles({ isMincho });

    useEffect(() => {
        const loadDraft = localStorage.getItem("myDraft");
        if (loadDraft) {
            const data = JSON.parse(loadDraft);
            const e = EditorState.createWithContent(convertFromRaw(JSON.parse(data.body)));
            const t = e.getCurrentContent().getPlainText();
            setTitle(data.title);
            if (t) {
                setText(t);
                onEditorChange(e);
            }
        }
    }, []);

    const [isSaved, setIsSaved] = useState(true);
    useEffect(() => {
        document.title = (isSaved ? "" : "*") + title;
    }, [title, isSaved]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isSaved) saveDraft(editorState);
        }, 5000);
        return () => clearTimeout(timer);
    }, [editorState]);

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

    const onMouseWheel = (e: React.WheelEvent<Scrollbars>) => {
        const currentScrollDelta = scrollbars.current?.getScrollLeft() || 0;
        scrollbars.current?.scrollLeft(currentScrollDelta - e.deltaY);
    };

    return (
        <div className={classes.root}>
            <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={500} ref={scrollbars} onWheel={onMouseWheel} style={styles.scroll}>
                <Box display="flex">
                    <Box m="auto">
                        <div className="tate" style={{ fontSize: fontSize + "px", height: height * fontSize + "px" }}>
                            <Editor editorState={editorState} onChange={onEditorChange} keyBindingFn={handleKey} />
                        </div>
                    </Box>
                </Box>
                <AppBar position="fixed" color="inherit" style={{ top: "auto", bottom: 0 }} className="appbar">
                    <div style={{ margin: "auto", padding: "8px" }} onMouseOver={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
                        <ButtonGroup
                            className="bgroup"
                            orientation="vertical"
                            color="inherit"
                            aria-label="vertical contained primary button group"
                            variant="text"
                        >
                            <Button size="small" variant="text" disabled></Button>
                            <span className={classes.textCenter}>{isMincho ? "明朝体" : "ゴシック体"}</span>
                            <Fade in={open} timeout={700}>
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setIsMincho(!isMincho)}
                                    className="control"
                                    style={{
                                        fontFamily: !isMincho
                                            ? `"游明朝体", "Yu Mincho", YuMincho, "Times New Roman", TimesNewRoman, serif`
                                            : `"游ゴシック体", "Yu Gothic", YuGothic, Arial, sans-serif`,
                                        fontWeight: !isMincho ? "normal" : 500,
                                        padding: "0 8px",
                                    }}
                                >
                                    {!isMincho ? "明朝体" : "ゴシック体"}
                                </Button>
                            </Fade>
                        </ButtonGroup>
                        <ButtonGroup
                            className="bgroup"
                            orientation="vertical"
                            color="inherit"
                            aria-label="vertical contained primary button group"
                            variant="text"
                        >
                            <Button size="small" variant="text" onClick={() => setFontSize(fontSize + 4)} disabled={fontSize >= 50}>
                                <ExpandLess className="control" />
                            </Button>
                            <span>文字サイズ {fontSize}</span>
                            <Button size="small" variant="text" onClick={() => setFontSize(fontSize - 4)} disabled={fontSize <= 8}>
                                <ExpandMore className="control" />
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup
                            className="bgroup"
                            orientation="vertical"
                            color="inherit"
                            aria-label="vertical contained primary button group"
                            variant="text"
                        >
                            <Button size="small" variant="text" onClick={() => setHeight(height + 1)} disabled={height >= 50}>
                                <ExpandLess className="control" />
                            </Button>
                            <span>字数 {height}</span>
                            <Button size="small" variant="text" onClick={() => setHeight(height - 1)} disabled={height <= 3}>
                                <ExpandMore className="control" />
                            </Button>
                        </ButtonGroup>
                    </div>
                </AppBar>
            </Scrollbars>
        </div>
    );
};

export default Vertical;
