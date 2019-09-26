import React, { useEffect, useState } from 'react';
import './WhichPart.scss';

function WhichPart(props) {
  const { switchPart } = props;
  const [options, setOptions] = useState([
    { option: 'legs', imgUrl: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/legs.svg', active: true },
    { option: 'cushions', imgUrl: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/cushions.svg', active: false },
    { option: 'base', imgUrl: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/base.svg', active: false },
    { option: 'supports', imgUrl: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/supports.svg', active: false },
    { option: 'back', imgUrl: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/back.svg', active: false }
  ]);

  useEffect(() => {
    switchPart(options.find(option => option.active));
  }, [options, switchPart])

  function handleSwitchPart(part) {
    setOptions(options.map(option =>  {
      if (option.option === part) {
        return {
          ...option,
          active: true
        }
      } else {
        return {
          ...option,
          active: false
        }
      }
    }))
  }

  return (
    <div className="which-part">
      {
        options.map(option => (
          <div
            className={`which-part__option ${option.active ? 'active' : ''}`}
            key={option.option}
            onClick={() => handleSwitchPart(option.option)}>
            <img src={option.imgUrl} alt={option.option} />
          </div>
        ))
      }
    </div>
  )
}

export default WhichPart;