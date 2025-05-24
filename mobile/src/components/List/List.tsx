import React, { memo, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StyleProp,
  ViewStyle,
  ListRenderItem,
  FlatListProps,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TouchableOpacityProps,
  Animated,
  Platform,
} from 'react-native';
import { Theme } from '@constants/theme';
import Text from '../Text';
import Divider from '../Divider';
import Icon from '../Icon';
import Loading from '../Loading';

type ListItemVariant = 'default' | 'compact' | 'spacious' | 'card';
type ListItemAlignment = 'top' | 'center' | 'bottom' | 'stretch';

export interface ListItemProps extends TouchableOpacityProps {
  /**
   * The main content of the list item
   */
  children: React.ReactNode;
  /**
   * The variant of the list item
   * @default 'default'
   */
  variant?: ListItemVariant;
  /**
   * The leading element (e.g., icon, avatar) to display at the start of the list item
   */
  leading?: React.ReactNode;
  /**
   * The trailing element (e.g., icon, button) to display at the end of the list item
   */
  trailing?: React.ReactNode;
  /**
   * The title of the list item
   */
  title?: string;
  /**
   * The subtitle of the list item
   */
  subtitle?: string;
  /**
   * The description text of the list item
   */
  description?: string;
  /**
   * Whether the list item should show a divider at the bottom
   * @default false
   */
  divider?: boolean;
  /**
   * Custom styles for the list item container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the content container
   */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the leading element container
   */
  leadingStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the trailing element container
   */
  trailingStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the title text
   */
  titleStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the subtitle text
   */
  subtitleStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the description text
   */
  descriptionStyle?: StyleProp<ViewStyle>;
  /**
   * Whether the list item is selected
   * @default false
   */
  selected?: boolean;
  /**
   * Whether the list item is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * The alignment of the list item content
   * @default 'center'
   */
  align?: ListItemAlignment;
  /**
   * Callback when the list item is pressed
   */
  onPress?: () => void;
  /**
   * Whether to show a chevron icon at the end of the list item
   * @default false
   */
  showChevron?: boolean;
  /**
   * The color of the chevron icon
   * @default Theme.colors.textSecondary
   */
  chevronColor?: string;
  /**
   * The size of the chevron icon
   * @default 20
   */
  chevronSize?: number;
  /**
   * Custom chevron icon name (if not using the default)
   * @default 'chevron-right'
   */
  chevronName?: string;
  /**
   * Custom chevron icon library
   * @default 'material-community'
   */
  chevronLibrary?: string;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A single list item component that can be used within a List.
 */
export const ListItem: React.FC<ListItemProps> = memo(({
  children,
  variant = 'default',
  leading,
  trailing,
  title,
  subtitle,
  description,
  divider = false,
  style,
  contentStyle,
  leadingStyle,
  trailingStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  selected = false,
  disabled = false,
  align = 'center',
  showChevron = false,
  chevronColor = Theme.colors.textSecondary,
  chevronSize = 20,
  chevronName = 'chevron-right',
  chevronLibrary = 'material-community',
  testID = 'list-item',
  ...rest
}) => {
  // Get the padding values based on the variant
  const getPadding = () => {
    const paddingMap: Record<ListItemVariant, { vertical: number; horizontal: number }> = {
      default: { vertical: 12, horizontal: 16 },
      compact: { vertical: 8, horizontal: 12 },
      spacious: { vertical: 16, horizontal: 20 },
      card: { vertical: 16, horizontal: 16 },
    };

    const padding = paddingMap[variant] || paddingMap.default;
    return {
      paddingVertical: padding.vertical,
      paddingHorizontal: padding.horizontal,
    };
  };

  // Get the styles for the list item container
  const containerStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      styles.container,
      getPadding(),
      {
        backgroundColor: selected ? Theme.colors.primaryLight : Theme.colors.surface,
        opacity: disabled ? 0.5 : 1,
        borderRadius: variant === 'card' ? Theme.borderRadius.md : 0,
        marginBottom: variant === 'card' ? 8 : 0,
        elevation: variant === 'card' ? 2 : 0,
        shadowColor: variant === 'card' ? Theme.colors.shadow : 'transparent',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: variant === 'card' ? 0.2 : 0,
        shadowRadius: variant === 'card' ? 2 : 0,
      },
      style,
    ],
    [variant, selected, disabled, style]
  );

  // Get the alignment styles
  const getAlignmentStyle = (): StyleProp<ViewStyle> => {
    const alignmentMap: Record<ListItemAlignment, ViewStyle> = {
      top: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      bottom: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
    };

    return alignmentMap[align] || alignmentMap.center;
  };

  // Render the leading element if provided
  const renderLeading = () => {
    if (!leading) return null;

    return (
      <View
        style={[
          styles.leading,
          getAlignmentStyle(),
          leadingStyle,
        ]}
      >
        {leading}
      </View>
    );
  };

  // Render the trailing element if provided or if showChevron is true
  const renderTrailing = () => {
    if (!trailing && !showChevron) return null;

    return (
      <View
        style={[
          styles.trailing,
          getAlignmentStyle(),
          trailingStyle,
        ]}
      >
        {trailing}
        {showChevron && !trailing && (
          <Icon
            name={chevronName}
            library={chevronLibrary}
            size={chevronSize}
            color={chevronColor}
            style={styles.chevron}
          />
        )}
      </View>
    );
  };

  // Render the content (title, subtitle, description, or custom children)
  const renderContent = () => {
    if (children) {
      return (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      );
    }

    return (
      <View style={[styles.content, contentStyle]}>
        {title && (
          <Text
            variant="body1"
            weight="medium"
            style={[styles.title, titleStyle]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            variant="body2"
            color="textSecondary"
            style={[styles.subtitle, subtitleStyle]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {description && (
          <Text
            variant="caption"
            color="textSecondary"
            style={[styles.description, descriptionStyle]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>
    );
  };

  // The main list item content
  const listItemContent = (
    <View style={styles.row}>
      {renderLeading()}
      {renderContent()}
      {renderTrailing()}
    </View>
  );

  // If onPress is provided, wrap in TouchableOpacity
  if (rest.onPress) {
    return (
      <>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={disabled}
          style={containerStyle}
          testID={testID}
          {...rest}
        >
          {listItemContent}
        </TouchableOpacity>
        {divider && <Divider />}
      </>
    );
  }

  // Otherwise, just render a View
  return (
    <>
      <View style={containerStyle} testID={testID} {...rest}>
        {listItemContent}
      </View>
      {divider && <Divider />}
    </>
  );
});

// List Section component
export interface ListSectionProps {
  /**
   * The title of the section
   */
  title?: string;
  /**
   * The subtitle of the section
   */
  subtitle?: string;
  /**
   * Whether the section is collapsible
   * @default false
   */
  collapsible?: boolean;
  /**
   * Whether the section is initially expanded (only applies if collapsible is true)
   * @default true
   */
  initiallyExpanded?: boolean;
  /**
   * Callback when the section header is pressed
   */
  onPress?: () => void;
  /**
   * Custom styles for the section container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the section header
   */
  headerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the section content
   */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * The children of the section
   */
  children: React.ReactNode;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A section component that can be used to group related list items.
 */
export const ListSection: React.FC<ListSectionProps> = memo(({
  title,
  subtitle,
  collapsible = false,
  initiallyExpanded = true,
  onPress,
  style,
  headerStyle,
  contentStyle,
  children,
  testID = 'list-section',
}) => {
  const [expanded, setExpanded] = React.useState(initiallyExpanded);
  const rotation = React.useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  const toggleSection = () => {
    if (collapsible) {
      Animated.spring(rotation, {
        toValue: expanded ? 0 : 1,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
      setExpanded(!expanded);
    }
    onPress?.();
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={[styles.section, style]} testID={testID}>
      {(title || subtitle || collapsible) && (
        <TouchableOpacity
          activeOpacity={collapsible ? 0.7 : 1}
          onPress={toggleSection}
          style={[styles.sectionHeader, headerStyle]}
          disabled={!collapsible && !onPress}
        >
          <View style={styles.sectionHeaderContent}>
            {title && (
              <Text variant="subtitle1" weight="medium" style={styles.sectionTitle}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text variant="body2" color="textSecondary" style={styles.sectionSubtitle}>
                {subtitle}
              </Text>
            )}
          </View>
          {collapsible && (
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Icon name="chevron-right" size={20} color={Theme.colors.textSecondary} />
            </Animated.View>
          )}
        </TouchableOpacity>
      )}
      <View style={[styles.sectionContent, contentStyle]}>
        {expanded ? children : null}
      </View>
    </View>
  );
});

// Main List component
export interface ListProps<T = any> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  /**
   * The data to render in the list
   */
  data?: T[];
  /**
   * Function to render each item in the list
   */
  renderItem?: ListRenderItem<T>;
  /**
   * Whether the list is loading
   * @default false
   */
  loading?: boolean;
  /**
   * The text to display when the list is loading
   * @default 'Loading...'
   */
  loadingText?: string;
  /**
   * Whether the list is empty
   * @default false
   */
  empty?: boolean;
  /**
   * The text to display when the list is empty
   * @default 'No items found'
   */
  emptyText?: string;
  /**
   * The component to render when the list is empty
   */
  emptyComponent?: React.ReactNode;
  /**
   * Whether to show a divider between list items
   * @default true
   */
  divider?: boolean;
  /**
   * The color of the divider
   * @default Theme.colors.border
   */
  dividerColor?: string;
  /**
   * Whether the list is refreshable
   * @default false
   */
  refreshable?: boolean;
  /**
   * Whether the list is currently refreshing
   * @default false
   */
  refreshing?: boolean;
  /**
   * Callback when the list is refreshed
   */
  onRefresh?: () => void;
  /**
   * The color of the refresh indicator
   * @default Theme.colors.primary
   */
  refreshColor?: string;
  /**
   * The background color of the refresh control
   * @default 'transparent'
   */
  refreshBackgroundColor?: string;
  /**
   * Custom styles for the list container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the loading container
   */
  loadingContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the empty container
   */
  emptyContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Custom styles for the empty text
   */
  emptyTextStyle?: StyleProp<ViewStyle>;
  /**
   * The number of columns to render in the list (for grid layout)
   * @default 1
   */
  numColumns?: number;
  /**
   * Whether to use a ScrollView instead of FlatList when the number of items is small
   * @default true
   */
  optimizeForSmallLists?: boolean;
  /**
   * The maximum number of items to render in a ScrollView before switching to FlatList
   * @default 10
   */
  smallListThreshold?: number;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * A customizable list component that can display items in a scrollable list.
 */
const List = <T extends any>({
  data = [],
  renderItem,
  loading = false,
  loadingText = 'Loading...',
  empty = false,
  emptyText = 'No items found',
  emptyComponent,
  divider = true,
  dividerColor = Theme.colors.border,
  refreshable = false,
  refreshing = false,
  onRefresh,
  refreshColor = Theme.colors.primary,
  refreshBackgroundColor = 'transparent',
  contentContainerStyle,
  loadingContainerStyle,
  emptyContainerStyle,
  emptyTextStyle,
  numColumns = 1,
  optimizeForSmallLists = true,
  smallListThreshold = 10,
  testID = 'list',
  ...rest
}: ListProps<T>) => {
  // Memoize the list key extractor
  const keyExtractor = (item: any, index: number) => {
    if (item && typeof item === 'object' && item.id !== undefined) {
      return `item-${item.id}`;
    }
    return `item-${index}`;
  };

  // Memoize the list item renderer
  const renderListItem: ListRenderItem<T> = ({ item, index, separators }) => {
    if (!renderItem) return null;
    
    const element = renderItem({ item, index, separators });
    
    // If the rendered item is already a ListItem with a divider, don't add another one
    if (React.isValidElement(element) && element.type === ListItem && element.props.divider !== undefined) {
      return element;
    }
    
    // Otherwise, wrap the item in a ListItem with a divider if needed
    return (
      <ListItem divider={divider && index < (data?.length || 0) - 1}>
        {element}
      </ListItem>
    );
  };

  // Render the loading state
  const renderLoading = () => (
    <View style={[styles.loadingContainer, loadingContainerStyle]} testID="loading-container">
      <Loading text={loadingText} />
    </View>
  );

  // Render the empty state
  const renderEmpty = () => {
    if (emptyComponent) return emptyComponent;
    
    return (
      <View style={[styles.emptyContainer, emptyContainerStyle]} testID="empty-container">
        <Text style={[styles.emptyText, emptyTextStyle]}>{emptyText}</Text>
      </View>
    );
  };

  // Render the list content
  const renderList = () => {
    // If loading, show loading indicator
    if (loading) {
      return renderLoading();
    }

    // If empty, show empty state
    if (empty || !data || data.length === 0) {
      return renderEmpty();
    }

    // For small lists, use a ScrollView for better performance
    if (optimizeForSmallLists && data.length <= smallListThreshold) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            numColumns > 1 && styles.gridContainer,
            contentContainerStyle,
          ]}
          testID={`${testID}-scrollview`}
          refreshControl={
            refreshable && onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[refreshColor]}
                tintColor={refreshColor}
                title={loadingText}
                titleColor={refreshColor}
                progressBackgroundColor={refreshBackgroundColor}
              />
            ) : undefined
          }
        >
          {data.map((item, index) => {
            const element = renderItem ? renderItem({ item, index, separators: {} as any }) : null;
            return (
              <View
                key={keyExtractor(item, index)}
                style={numColumns > 1 ? { width: `${100 / numColumns}%` } : undefined}
              >
                {element}
                {divider && index < data.length - 1 && numColumns === 1 && (
                  <Divider color={dividerColor} />
                )}
              </View>
            );
          })}
        </ScrollView>
      );
    }

    // For larger lists, use FlatList
    return (
      <FlatList
        data={data}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        key={numColumns > 1 ? `list-${numColumns}` : 'list'}
        numColumns={numColumns}
        contentContainerStyle={[
          styles.contentContainer,
          numColumns > 1 && styles.gridContainer,
          contentContainerStyle,
        ]}
        refreshControl={
          refreshable && onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[refreshColor]}
              tintColor={refreshColor}
              title={loadingText}
              titleColor={refreshColor}
              progressBackgroundColor={refreshBackgroundColor}
            />
          ) : undefined
        }
        testID={`${testID}-flatlist`}
        {...rest}
      />
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      {renderList()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  // ListItem styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  leading: {
    marginRight: Theme.spacing.md,
    justifyContent: 'center',
  },
  trailing: {
    marginLeft: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 4,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginBottom: 2,
  },
  description: {
    marginTop: 2,
  },
  // Section styles
  section: {
    width: '100%',
    marginBottom: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  sectionSubtitle: {
    opacity: 0.7,
  },
  sectionContent: {
    width: '100%',
  },
});

// Export components
export default Object.assign(List, {
  Item: ListItem,
  Section: ListSection,
});
