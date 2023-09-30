import ChunkGraph from './ChunkGraph';
import LessonStep from './LessonStep';
import RichText from '../../RichText';

const Chunk = ({
  chunkTitle,
  steps = [],
  chunkNum,
  durList,
}) => {
  return (
    <div className='mb-3'>
      <div className='bg-light-gray p-3 mt-4 mx-0 mb-3 rounded'>
        <h6 className='fw-bold mb-0'>
          <RichText content={chunkTitle} />
        </h6>
        <ChunkGraph durList={durList} chunkNum={chunkNum} />
      </div>
      <div className='border-l'>
        {steps.map(step => <LessonStep key={step.Step} {...step} />)}
      </div>
    </div>
  );
};

export default Chunk;