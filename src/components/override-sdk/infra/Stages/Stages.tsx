import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { Check, ChevronsRight } from 'lucide-react';

interface StagesProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  stages: any[];
}

/**
 * API to filter out the alternate stages which are not in active and return all other stages
 * @param {Array} stages - Stages of a case type
 *
 * @returns {Array} - Returns stages which are non alternate stages and alternate stage which is active.
 */
function getFilteredStages(stages) {
  if (!Array.isArray(stages)) {
    return [];
  }

  return stages.filter((stage) => stage.type !== 'Alternate' || (stage.type === 'Alternate' && stage.visited_status === 'active'));
}

/* TODO - this component should be refactored and not exposed as top level DX Component -
  the stages should be created as part of the CaseView */
export default function Stages(props: StagesProps) {
  const { getPConnect, stages } = props;
  const pConn = getPConnect();
  const key = `${pConn.getCaseInfo().getClassName()}!CASE!${pConn.getCaseInfo().getName()}`.toUpperCase();

  const filteredStages = getFilteredStages(stages);
  const currentStageID = pConn.getValue(PCore.getConstants().CASE_INFO.STAGEID, ''); // 2nd arg empty string until typedef allows optional
  const stagesObj = filteredStages.map((stage, index, arr) => {
    const theID = stage.ID || stage.id;
    return {
      name: PCore.getLocaleUtils().getLocaleValue(stage.name, undefined, key),
      id: theID,
      complete: stage.visited_status === 'completed',
      current: theID === currentStageID,
      last: index === arr.length - 1
    };
  });

  // debugging/investigation help
  // console.log(`Stages: current: ${currentStageID} stagesObj: ${JSON.stringify(stagesObj)}`);

  function getStage(stage, index) {
    let stageClass;
    if (stage.current) {
      stageClass = 'font-semibold text-blue-700 dark:text-blue-400';
    } else if (stage.complete) {
      stageClass = 'text-foreground';
    } else {
      stageClass = 'text-muted-foreground';
    }

    return (
      <span key={index} className='inline-flex items-center'>
        {stage.complete ? <Check className='mr-1 h-4 w-4 text-muted-foreground' /> : null}
        <span className={`text-base ${stageClass}`}>{stage.name}</span>
      </span>
    );
  }

  function getStages(inStages) {
    return (
      <nav aria-label='stages' className='flex flex-wrap items-center gap-1'>
        {inStages.map((stage, index) => {
          return (
            <span key={index} className='inline-flex items-center'>
              {getStage(stage, index)}
              {!stage.last && <ChevronsRight className='mx-1 h-4 w-4 text-muted-foreground/50' />}
            </span>
          );
        })}
      </nav>
    );
  }

  return (
    <div id='Stages' className='m-1 rounded-lg border bg-card p-1 shadow-sm'>
      {/* Stages<br />
      currentStageID: {currentStageID}<br />
      {JSON.stringify(stagesObj)}<br /><br /> */}
      {getStages(stagesObj)}
    </div>
  );
}
