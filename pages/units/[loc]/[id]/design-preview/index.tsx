import Layout from '../../../../../components/Layout';
import UnitDesignPreview from '../../../../../components/UnitPreview/UnitDesignPreview';
import { TUnitForUI } from '../../../../../backend/models/Unit/types/unit';

type TUnitDesignPreviewProps = {
  unit?: TUnitForUI | null;
};

const UnitDesignPreviewPage: React.FC<TUnitDesignPreviewProps> = ({ unit }) => {
  if (!unit) {
    return (
      <Layout title="Unit preview">
        <div style={{ padding: '40px 16px' }}>Unit not found.</div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Unit preview: ${unit.Title ?? 'Unit'}`}
      description={
        unit.Sections?.overview?.TheGist ??
        unit.Sections?.overview?.LearningSummary ??
        'Unit preview.'
      }
      imgSrc={unit.UnitBanner ?? undefined}
      imgAlt={unit.Title ? `${unit.Title} banner` : 'Unit banner'}
    >
      <UnitDesignPreview unit={unit} />
    </Layout>
  );
};

export { getStaticPaths, getStaticProps } from '../index';

export default UnitDesignPreviewPage;
