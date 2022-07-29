import PropTypes from 'prop-types';

import Accordion from '../../Accordion';

const MaterialSet = ({
  materialSet,
}) => {
  return (
    <div className='container mx-auto'>
      {materialSet.links && (
        <a href={materialSet.links.url} className='d-block mb-3'>
          [TODO: dl icon] {materialSet.links.linkText}
        </a>
      )}

      {materialSet.parts
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
                {part.itemList.map(item => (
                  <li key={item.itemTitle} className='mb-2'>
                    <strong>{item.itemTitle}</strong>
                    <ul>
                      {/* TODO: DATA: always want an array */}
                      {(Array.isArray(item.links) ? item.links : [item.links]).map(link => (
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