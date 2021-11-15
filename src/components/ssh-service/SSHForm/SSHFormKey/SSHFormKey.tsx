import { isEmpty } from 'lodash';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import sshpk from 'sshpk';

import { InternalReduxStore } from '@openshift-console/dynamic-plugin-sdk-internal-kubevirt';
import { Button, FileUpload, Flex, FlexItem } from '@patternfly/react-core';

import useSSHKeys from '../../../../hooks/use-ssh-keys';
import { sshActions, SSHActionsNames } from '../../redux/actions';
import { ValidatedOptions } from '../ssh-form-utils';
import SSHFormSaveInNamespace from '../SSHFormSave/SSHFormSaveInNamespace';

import './ssh-form-key.scss';

const SSHFormKey: React.FC = () => {
  const { t } = useTranslation();
  const { key, tempSSHKey, updateSSHTempKey, showRestoreKeyButton, setIsValidSSHKey } =
    useSSHKeys();
  const [filename, setFilename] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [helperText, setHelperText] = React.useState<string>('');
  const [validated, setValidated] = React.useState<ValidatedOptions>(ValidatedOptions.default);

  const valueChanged = React.useCallback(
    (val: string) => {
      updateSSHTempKey(val);
      InternalReduxStore?.dispatch(
        sshActions[SSHActionsNames.disableSaveInNamespaceCheckbox](isEmpty(val)),
      );
    },
    [updateSSHTempKey],
  );

  const onChange = (val: string, name: string) => {
    valueChanged(val);
    setFilename(name);
    setHelperText('');
    setValidated(ValidatedOptions.default);
    if (val) {
      try {
        const evaluatedKey = sshpk.parseKey(val, 'ssh');
        setValidated(ValidatedOptions.success);
        setHelperText(`Key Type is ${evaluatedKey.type}`);
        setIsValidSSHKey(true);
      } catch {
        setValidated(ValidatedOptions.error);
        setIsValidSSHKey(false);
        setHelperText(t('kubevirt-plugin~Invalid SSH public key format'));
      }
    }
  };

  return (
    <>
      <FileUpload
        id="simple-text-file"
        className="SSHFormKey-input-field"
        type="text"
        value={tempSSHKey}
        filename={filename}
        onChange={onChange}
        onReadStarted={() => setIsLoading(true)}
        onReadFinished={() => setIsLoading(false)}
        isLoading={isLoading}
        validated={validated}
        allowEditingUploadedText
        isReadOnly={false}
      />
      {helperText && <div className={`SSHFormKey-helperText-${validated}`}>{helperText}</div>}
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsCenter' }}
        className="SSHFormKey-flex"
      >
        <FlexItem>
          <SSHFormSaveInNamespace />
        </FlexItem>
        {showRestoreKeyButton && key && (
          <FlexItem>
            <Button
              className="SSHFormKey-restore-button"
              onClick={() => onChange(key, '')}
              variant="link"
              isInline
            >
              {t('kubevirt-plugin~Restore Key')}
            </Button>
          </FlexItem>
        )}
      </Flex>
    </>
  );
};

export default SSHFormKey;
