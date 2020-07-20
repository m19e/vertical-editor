import React, { useState } from "react";
import { Editor, EditorState, getDefaultKeyBinding } from "draft-js";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );
    const initialSelection = editorState.getSelection();

    const handleArrow = (e: React.KeyboardEvent) => {
        const selection = editorState.getSelection();
        setSelectionStateInputs({
            anchorOffset: selection.getAnchorOffset(),
            focusOffset: selection.getFocusOffset(),
            anchorKey: selection.getAnchorKey(),
            focusKey: selection.getFocusKey(),
        });
        // console.log("INPUT:", JSON.stringify(selectionStateInputs, null, 4));

        if (e.key.includes("Arrow")) {
            e.preventDefault();

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
            console.log(JSON.stringify(window.getSelection()?.anchorOffset));

            // console.log(
            //     "INPUT:",
            //     JSON.stringify(selectionStateInputs, null, 4)
            // );
            // const {
            //     anchorOffset,
            //     focusOffset,
            //     anchorKey,
            //     focusKey,
            // } = selectionStateInputs;
            // const inc = anchorOffset + 1;
            // const newSelection = selection.merge({
            //     anchorOffset: inc,
            //     focusOffset: inc,
            //     anchorKey,
            //     focusKey,
            // });
            // console.log("NEW:", JSON.stringify(newSelection, null, 4));
            // setSelectionStateInputs({
            //     anchorOffset: inc,
            //     focusOffset: inc,
            //     anchorKey,
            //     focusKey,
            // });
            // const newEditor = EditorState.acceptSelection(
            //     editorState,
            //     newSelection
            // );
            // setEditorState(
            //     EditorState.push(
            //         newEditor,
            //         newEditor.getCurrentContent(),
            //         "insert-characters"
            //     )
            // );
            // console.log(JSON.stringify(editorState.getSelection(), null, 4));
        }
        return getDefaultKeyBinding(e);
    };

    const onEditorChange = (editor: EditorState) => {
        setEditorState(editor);
    };

    const setSelectionState = (d: number) => {
        const selection = editorState.getSelection();
        console.log(JSON.parse(JSON.stringify(selection)));
        let { anchorOffset, focusOffset, anchorKey, focusKey } = JSON.parse(
            JSON.stringify(selection)
        );
        anchorOffset = anchorKey + d;
        focusOffset = focusOffset + d;
        const newSelection = selection.merge({
            anchorOffset,
            focusOffset,
            anchorKey,
            focusKey,
        });
        const newEditor = EditorState.forceSelection(editorState, newSelection);
        onEditorChange(newEditor);
    };

    return (
        <div className="tate">
            <h1>Draft.js sample</h1>
            <Editor
                editorState={editorState}
                onChange={setEditorState}
                keyBindingFn={handleArrow}
            />
        </div>
    );
};

export default Vertical;
