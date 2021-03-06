import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { connect, Dispatch } from 'react-redux';
import { action } from 'typesafe-actions';

import {
  ALL_APPLICATIONS_KEY,
  ALL_NAMESPACES_KEY,
  APPLICATION_LOCAL_STORAGE_KEY,
  APPLICATION_USERSETTINGS_PREFIX,
  RootState,
  UNASSIGNED_APPLICATIONS_KEY,
} from '@kubevirt-internal';

import ApplicationDropdown from './ApplicationDropdown';

interface NamespaceBarApplicationSelectorProps {
  disabled?: boolean;
}

interface StateProps {
  namespace: string;
  application: string;
}

interface DispatchProps {
  onChange: (name: string) => void;
}

type Props = NamespaceBarApplicationSelectorProps & StateProps & DispatchProps;

const NamespaceBarApplicationSelector: React.FC<Props> = ({
  namespace,
  application,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation();
  const allApplicationsTitle = t('topology~all applications');
  const noApplicationsTitle = t('topology~no application group');
  const dropdownTitle: string =
    application === ALL_APPLICATIONS_KEY
      ? allApplicationsTitle
      : application === UNASSIGNED_APPLICATIONS_KEY
      ? noApplicationsTitle
      : application;
  const [title, setTitle] = React.useState<string>(dropdownTitle);
  React.useEffect(() => {
    if (!disabled) {
      setTitle(dropdownTitle);
    }
  }, [disabled, dropdownTitle]);
  if (namespace === ALL_NAMESPACES_KEY) return null;

  const onApplicationChange = (newApplication: string, key: string) => {
    key === ALL_APPLICATIONS_KEY ? onChange(key) : onChange(newApplication);
  };

  return (
    <ApplicationDropdown
      className="co-namespace-selector"
      menuClassName="co-namespace-selector__menu"
      buttonClassName="pf-m-plain"
      namespace={namespace}
      title={title && <span className="btn-link__title">{title}</span>}
      titlePrefix={t('topology~Application')}
      allSelectorItem={{
        allSelectorKey: ALL_APPLICATIONS_KEY,
        allSelectorTitle: allApplicationsTitle,
      }}
      noneSelectorItem={{
        noneSelectorKey: UNASSIGNED_APPLICATIONS_KEY,
        noneSelectorTitle: noApplicationsTitle,
      }}
      selectedKey={application || ALL_APPLICATIONS_KEY}
      onChange={onApplicationChange}
      userSettingsPrefix={APPLICATION_USERSETTINGS_PREFIX}
      storageKey={APPLICATION_LOCAL_STORAGE_KEY}
      disabled={disabled}
    />
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  namespace: state.UI.get('activeNamespace'),
  application: state.UI.get('activeApplication'),
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onChange: (application: string) => {
    dispatch(action('setActiveApplication', { application }));
  },
});

export default connect<StateProps, DispatchProps, NamespaceBarApplicationSelectorProps>(
  mapStateToProps,
  mapDispatchToProps,
)(NamespaceBarApplicationSelector);
