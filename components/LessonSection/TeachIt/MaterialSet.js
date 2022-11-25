import PropTypes from 'prop-types';

import Accordion from '../../Accordion';

const MaterialSet = ({
  materialSet,
}) => {
  return (
    <div className='container mx-auto mb-4'>
      {materialSet.links && (
        <button href={materialSet.links.url} className='btn btn-primary px-3 py-2 d-block mb-3 d-flex align-items-center gap-2 mx-auto'>
          <i className="bi-cloud-arrow-down-fill fs-3 lh-1"></i>{' '}
          {materialSet.links.linkText}
        </button>
      )}

      {materialSet.parts && materialSet.parts
        .map(part => (
          <Accordion
            buttonClassName='w-100 text-start'
            key={part.part}
            id={`teachit_env_${part.part}`}
            button={(
              <div>
                <h6>Part {part.part}: {part.title}</h6>
                <div>{part.preface}</div>
              </div>
            )}
          >
            <>
              <ol className='mt-3'>
                {part.itemList && part.itemList.map(item => (
                  <li key={item.itemTitle} className='mb-2'>
                    <strong>{item.itemTitle}</strong>
                    <ul>
                      {/* TODO: DATA: always want an array */}
                      {item.links && (Array.isArray(item.links) ? item.links : [item.links]).map(link => (
                        <li key={link.url}>
                          <a href={link.url}>
                            {link.linkText}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              <h5>Steps and Flow</h5>
            </>
          </Accordion>
        ))
      }
    </div>
  );
};

MaterialSet.propTypes = {
  materialSet: PropTypes.shape({
    links: PropTypes.shape({
      url: PropTypes.string,
      linkText: PropTypes.string,
    }),
    parts: PropTypes.arrayOf(PropTypes.shape({
      part: PropTypes.number,
      itemList: PropTypes.arrayOf(PropTypes.object),
    })),
  }),
};

export default MaterialSet;