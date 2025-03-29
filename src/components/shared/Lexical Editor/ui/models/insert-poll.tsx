import { LexicalEditor } from "lexical";
import { useState } from "react";
import { INSERT_POLL_COMMAND } from "../../plugins/PollPlugin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InsertPoll({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): React.JSX.Element {
  const [question, setQuestion] = useState('');

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_POLL_COMMAND, question);
    onClose();
  };

  return (
    <div className='space-y-4'>
      <Input placeholder='Question?' onChange={(e)=>setQuestion(e.target.value)}   value={question} />
      <Button disabled={question.trim() === ''} onClick={onClick}>
          Confirm
      </Button>
    </div>
  );
}