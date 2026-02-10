import Layout from '../../../../../components/Layout';
import UnitDesignPreview from '../../../../../components/UnitPreview/UnitDesignPreview';
import { TUnitForUI } from '../../../../../backend/models/Unit/types/unit';
import { buildUnitUrl, DEFAULT_LOCALE } from '../../../../../shared/seo';

type TUnitDesignPreviewProps = {
  unit?: TUnitForUI | null;
};

const UnitDesignPreviewPage: React.FC<TUnitDesignPreviewProps> = ({ unit }) => {
  const fallbackUrl = buildUnitUrl(DEFAULT_LOCALE, 'preview');

  if (!unit) {
    return (
      <Layout
        title="Unit preview"
        description="Unit preview."
        imgSrc=""
        imgAlt="Unit preview"
        url={fallbackUrl}
        langLinks={[]}
      >
        <div style={{ padding: '40px 16px' }}>Unit not found.</div>
      </Layout>
    );
  }

  const locale = unit.locale ?? DEFAULT_LOCALE;
  const unitId = `${unit.numID ?? 'preview'}`;
  const url = buildUnitUrl(locale, unitId);

  return (
    <Layout
      title={`Unit preview: ${unit.Title ?? 'Unit'}`}
      description={
        unit.Sections?.overview?.TheGist ??
        'Unit preview.'
      }
      imgSrc={unit.UnitBanner ?? ''}
      imgAlt={unit.Title ? `${unit.Title} banner` : 'Unit banner'}
      url={url}
      langLinks={unit.headLinks ?? []}
    >
      <UnitDesignPreview unit={unit} />
    </Layout>
  );
};

export { getStaticPaths, getStaticProps } from '../index';

export default UnitDesignPreviewPage;
