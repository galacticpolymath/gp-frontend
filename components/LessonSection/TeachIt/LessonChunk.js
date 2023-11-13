import ChunkGraph from './ChunkGraph';
import LessonStep from './LessonStep';
import RichText from '../../RichText';

const Chunk = ({
  chunkTitle,
  steps = [],
  chunkNum,
  chunkDur,
  durList,
}) => {
  return (
    <div className='mb-3'>
      {/* <div className='bg-light-gray p-3 mt-4 mx-0 mb-3 rounded'> */}
      <h6 className='fw-bold mb-0 text-primary ms-1'>
        <span>
          <i className='bi bi-hourglass-split pe-1'></i>
          <RichText className='d-inline-block' content={`${chunkDur} min: ${chunkTitle}`} />
        </span>
      </h6>
      <div className='d-col col-12 col-lg-7'>
        <ChunkGraph
          className='mt-0'
          durList={durList}
          chunkNum={chunkNum}
        />
      </div>
      {/* </div> */}
      <div className='border-l'>
        {steps.map(step => <LessonStep key={step.Step} {...step} />)}
      </div>
    </div>
  );
};

export default Chunk;