import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { FieldLevelHelp } from '@kubevirt-internal';
import { ExternalLink } from '@kubevirt-internal/components/ExternalLink';
import { Text, TextVariants } from '@patternfly/react-core';

const SysprepUnattendHelperPopup: React.FC = () => {
  const { t } = useTranslation('kubevirt-plugin');
  return (
    <FieldLevelHelp testId="sysprep-unattend-popover-button">
      <div data-test="sysprep-unattend-popover">
        <Trans t={t} ns="kubevirt-plugin">
          <Text component={TextVariants.h6}>Unattend.xml</Text>
          <Text component={TextVariants.p}>
            Unattend can be used to configure windows setup and can be picked up several times
            during windows setup/configuration.
          </Text>
          <ExternalLink
            href="https://kubevirt.io/user-guide/virtual_machines/startup_scripts/#sysprep"
            text={t('kubevirt-plugin~Learn more')}
          />
        </Trans>
      </div>
    </FieldLevelHelp>
  );
};

export default SysprepUnattendHelperPopup;
