import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { K8sKind } from '@kubevirt-types';
import { K8sResourceKind } from '@kubevirt-types';
import { FirehoseResult } from '@openshift-console/dynamic-plugin-sdk';
import { FormSelect, FormSelectOption } from '@patternfly/react-core';

import { getName, ValidationErrorType, ValidationObject } from '../../selectors';
import { getLoadedData, getLoadError, isLoaded } from '../../utils';
import { ignoreCaseSort } from '../../utils/sort';

import { FormRow } from './form-row';
import { asFormSelectValue, FormSelectPlaceholderOption } from './form-select-placeholder-option';

type K8sResourceSelectProps = {
  id: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isPlaceholderDisabled?: boolean;
  hasPlaceholder?: boolean;
  data?: FirehoseResult<K8sResourceKind[]>;
  name?: string;
  onChange: (name: string) => void;
  model: K8sKind;
  title?: string;
  validation?: ValidationObject;
  filter?: (obj: K8sResourceKind) => boolean;
  getResourceLabel?: (resource: K8sResourceKind) => string;
};

export const K8sResourceSelectRow: React.FC<K8sResourceSelectProps> = ({
  id,
  isDisabled,
  isRequired,
  isPlaceholderDisabled,
  hasPlaceholder,
  data,
  onChange,
  name,
  model,
  title,
  validation,
  filter,
  getResourceLabel,
}) => {
  const { t } = useTranslation();
  const isLoading = !isLoaded(data);
  const loadError = getLoadError(data, model);

  let loadedData = getLoadedData(data, []);

  if (filter) {
    loadedData = loadedData.filter(filter);
  }

  let nameValue;
  let missingError;

  if (name && !isLoading && !loadError && !loadedData.some((entity) => getName(entity) === name)) {
    missingError = t('kubevirt-plugin~Selected {{name}} is not available', { name });
  } else {
    nameValue = name;
  }

  return (
    <FormRow
      title={title || model.label}
      fieldId={id}
      isLoading={isLoading}
      validationMessage={loadError || missingError || (validation && validation.messageKey)}
      validationType={
        loadError || missingError ? ValidationErrorType.Error : validation && validation.type
      }
      isRequired={isRequired}
    >
      <FormSelect
        onChange={onChange}
        value={asFormSelectValue(nameValue)}
        id={id}
        isDisabled={isDisabled || isLoading || loadError}
      >
        {hasPlaceholder && (
          <FormSelectPlaceholderOption
            isDisabled={isPlaceholderDisabled}
            placeholder={
              loadedData.length === 0
                ? `--- ${model.labelPlural} not available ---`
                : `--- Select ${model.label} ---`
            }
          />
        )}
        {ignoreCaseSort(loadedData, ['metadata', 'name']).map((entity) => {
          const selectName = getName(entity);
          const label = getResourceLabel && getResourceLabel(entity);

          return (
            <FormSelectOption key={selectName} value={selectName} label={label || selectName} />
          );
        })}
      </FormSelect>
    </FormRow>
  );
};
