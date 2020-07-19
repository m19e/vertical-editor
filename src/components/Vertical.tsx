import React, { useState } from "react";
import { Editor, EditorState, getDefaultKeyBinding } from "draft-js";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );

    const handleArrow = (e: React.KeyboardEvent) => {
        if (e.key.includes("Arrow")) {
            // e.preventDefault();
            const currentSelection = editorState.getSelection();
            console.log(JSON.stringify(currentSelection, null, 4));
        }
        return getDefaultKeyBinding(e);
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
