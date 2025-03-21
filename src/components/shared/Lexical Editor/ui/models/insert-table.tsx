import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { LexicalEditor } from "lexical";
import { JSX, useEffect, useState } from "react";

export function InsertTable({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
    });

    onClose();
  };

  return (
    <div className="flex flex-col gap-y-2  ">
      <Input
        placeholder={"# of rows (1-500)"}
        onChange={(e) => {
          setRows(e.target.value);
        }}
        value={rows}
        data-test-id="table-modal-rows"
        type="number"
      />
      <Input
        placeholder={"# of columns (1-50)"}
        onChange={(e) => {
          setColumns(e.target.value);
        }}
        value={columns}
        data-test-id="table-modal-columns"
        type="number"
      />
      <Button className="w-full" disabled={isDisabled} onClick={onClick}>
        Confirm
      </Button>
    </div>
  );
}
