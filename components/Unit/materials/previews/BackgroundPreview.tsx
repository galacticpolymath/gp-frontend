import React from 'react';

type TBackgroundPreviewProps = {
  renderBackgroundPanel: (...args: any[]) => React.ReactNode;
};

const BackgroundPreview: React.FC<TBackgroundPreviewProps> = ({ renderBackgroundPanel }) => {
  return <>{renderBackgroundPanel(true)}</>;
};

export default BackgroundPreview;
