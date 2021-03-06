import * as React from 'react';
import { useTranslation } from 'react-i18next';
import xml from 'xml2js';

import { InternalReduxStore } from '@openshift-console/dynamic-plugin-sdk-internal-kubevirt';
import { FileUpload, Text, TextVariants } from '@patternfly/react-core';

import { SysprepActions, SysprepActionsNames } from '../../../../../redux/actions/sysprep-actions';
import { ValidatedOptions } from '../../../../../utils/validations/common';

export type SysprepFile = {
  isLoading: boolean;
  fileName: string;
  validated: ValidatedOptions;
  value: string;
};

type SysprepFileFieldProps = {
  id: string;
};

const SysprepFileField: React.FC<SysprepFileFieldProps> = ({ id }) => {
  const { t } = useTranslation();
  const [data, setData] = React.useState<SysprepFile>({
    validated: ValidatedOptions.default,
    fileName: '',
    value: '',
    isLoading: false,
  });

  const onChange = React.useCallback(
    (value: string, fileName: string) => {
      setData((currentSysprepFile) => ({
        ...currentSysprepFile,
        validated: ValidatedOptions.default,
        value,
        fileName,
      }));

      xml.parseString(value || '', (parseError, parseResult) => {
        parseResult &&
          InternalReduxStore?.dispatch(
            SysprepActions[SysprepActionsNames.updateValue]({ [id]: value }),
          );
        setData((currentSysprepFile) => ({
          ...currentSysprepFile,
          validated: parseError ? ValidatedOptions.error : ValidatedOptions.default,
        }));
      });
    },
    [id],
  );
  return (
    <>
      <FileUpload
        id={`sysprep-${id}-input`}
        data-test={`sysprep-${id.toLowerCase().replace('.', '-')}-input`}
        type="text"
        value={data.value}
        filename={data.fileName}
        onChange={onChange}
        onReadStarted={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: true }))
        }
        onReadFinished={() =>
          setData((currentData: SysprepFile) => ({ ...currentData, isLoading: false }))
        }
        isLoading={data.isLoading}
        validated={data.validated}
        allowEditingUploadedText
        isReadOnly={false}
      />
      {data.validated === ValidatedOptions.error && (
        <Text component={TextVariants.p} className="kv-sysprep--error">
          {t('kubevirt-plugin~XML structure is not valid')}
        </Text>
      )}
    </>
  );
};

export default SysprepFileField;
