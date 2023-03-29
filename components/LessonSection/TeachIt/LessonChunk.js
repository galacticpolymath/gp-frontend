import ChunkGraph from './ChunkGraph';
import LessonStep from './LessonStep';

const Chunk = ({
  chunkTitle,
  steps = [],
  chunkNum,
  durList,
}) => {
  return (
    <>
      <div className='bg-light-gray p-3 mb-3 rounded'>
        <h5 className='fw-bold mb-0'>{chunkTitle}</h5>
        <ChunkGraph durList={durList} chunkNum={chunkNum} />
      </div>
      <div className='border-l'>
        {steps.map(step => <LessonStep key={step.Step} {...step} />)}
      </div>
    </>
  );
};

export default Chunk;