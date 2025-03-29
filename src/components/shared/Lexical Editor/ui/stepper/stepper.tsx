import { Reorder, AnimatePresence } from "framer-motion";
import Step from "./step";
import { $isStepperNode, initialEditorState, StepsType } from "../../nodes/Stepper";
import { $getNodeByKey, createEditor, NodeKey } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function Stepper({
  steps,
  nodeKey,
}: {
  steps: StepsType,
  nodeKey: NodeKey,
}) {
  const [editor] = useLexicalComposerContext();

  
  
  function SetSteps(steps:StepsType){
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        node.replaceSteps(steps);
      }
    });
  }

  const remove = (index: number) => {    
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        node.deleteStep(index);
      }
    });
  };

  function updateTitle(id: number, title: string) {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        node.updateTitle(id, title);
      }
    });
  }

  const insertAt = (index: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isStepperNode(node)) {
        const newId = Date.now(); 
        const newEditor = createEditor();
        const parsedEditorState = newEditor.parseEditorState(
          JSON.stringify(initialEditorState)
        );
        newEditor.setEditorState(parsedEditorState);
        const newStep = {
          id: newId, 
          title: `New step `,
          content: newEditor,
        };
        
        node.insertStepAtIndex(newStep, index);
      }
    });
  };


  return (
    <Reorder.Group
      axis="y"
      values={steps}
      onReorder={SetSteps}
      className="h-fit my-2 min-h-[90px] w-full overflow-hidden flex flex-col relative"
    >
      <AnimatePresence initial={false}>
        {steps.map((item, index) => (
          <Step 
            updateTitle={updateTitle} 
            remove={remove} 
            insertAt={insertAt} 
            key={item.id} 
            numberd={index} 
            item={item} 
          />
        ))}
      </AnimatePresence>
      <div className="absolute w-0.5 max-sm:left-2 left-[13px] rounded-sm -z-1 bg-input top-4 h-full" />
    </Reorder.Group>
  );
}
