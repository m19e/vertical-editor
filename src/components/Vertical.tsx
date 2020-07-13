import React, { useState } from "react";
import { Editor, EditorState } from "draft-js";
import "./Vertical.css";

const Vertical = (): JSX.Element => {
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );

    return (
        <div className="tate">
            <h1>Draft.js sample</h1>
            <Editor editorState={editorState} onChange={setEditorState} />
        </div>
    );
};

export default Vertical;
