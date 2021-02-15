import React, {useCallback, useEffect, useState} from 'react';
import {Placeholder} from '../../components/ListPlaceholders';
import SimpleList from '../../components/SimpleList';
import {useTracked} from '../../provider';
import {Actions} from '../../provider/Actions';
import {DDS} from '../../services/DeviceDetection';
import {eSendEvent} from '../../services/EventManager';
import Navigation from '../../services/Navigation';
import SearchService from '../../services/SearchService';
import { InteractionManager } from '../../utils';
import {eScrollEvent} from '../../utils/Events';

export const Tags = ({route, navigation}) => {
  const [state, dispatch] = useTracked();
  const tags = state.tags;
  const [loading, setLoading] = useState(true);
  let pageIsLoaded = false;

  let ranAfterInteractions = false;
 

  const runAfterInteractions = () => {
    InteractionManager.runAfterInteractions(() => {
      if (loading) {
        setLoading(false);
      }

      Navigation.routeNeedsUpdate('Tags',() => {
        dispatch({type:Actions.TAGS})
      })

      eSendEvent(eScrollEvent, {name: 'Tags', type: 'in'});
      if (DDS.isLargeTablet()) {
        dispatch({
          type: Actions.CONTAINER_BOTTOM_BUTTON,
          state: {
            onPress: null,
          },
        });
      }
      updateSearch();
      ranAfterInteractions = false;
    });


  };

  const onFocus = useCallback(() => {
    if (!ranAfterInteractions) {
  
      ranAfterInteractions = true;
      runAfterInteractions();
    }
  
    if (!pageIsLoaded) {
      pageIsLoaded = true;
      return;
    }
    Navigation.setHeaderState(
      'Tags',
      {
        menu: true,
      },
      {
        heading: 'Tags',
        id: 'tags_navigation',
      },
    );
  }, []);

  useEffect(() => {
    if (!ranAfterInteractions) {
      ranAfterInteractions = true;
      runAfterInteractions();
    }
    navigation.addListener('focus', onFocus);
    return () => {
      pageIsLoaded = false;  
      ranAfterInteractions = false;
      eSendEvent(eScrollEvent, {name: 'Tags', type: 'back'});
      navigation.removeListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    if (navigation.isFocused()) {
      updateSearch();
    }
  }, [tags]);

  const updateSearch = () => {
    SearchService.update({
      placeholder: 'Search in tags',
      data: tags,
      type: 'tags',
      title:"Tags"
    });
  };

  return (
    <SimpleList
    listData={tags}
      type="tags"
      headerProps={{
        heading: 'Tags',
      }}
      loading={loading}
      focused={() => navigation.isFocused()}
      placeholderData={{
        heading: 'Your Tags',
        paragraph: 'You have not created any tags for your notes yet.',
        button: null,
        loading: 'Loading your tags.',
      }}
      placeholder={<Placeholder type="tags" />}
      placeholderText="Tags added to notes appear here"
    />
  );
};

export default Tags;
