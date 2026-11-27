/**
 * Base Sorting Strategy Interface
 */
class EventSortStrategy {
  getOrderByClause() {
    throw new Error('getOrderByClause() must be implemented by concrete strategy');
  }
}

/**
 * Sort By Date: Earliest upcoming event first (ASC)
 */
class SortByDateStrategy extends EventSortStrategy {
  getOrderByClause() {
    return 'e.date ASC, e.time ASC';
  }
}

/**
 * Sort By Title: Alphabetical by event title
 */
class SortByTitleStrategy extends EventSortStrategy {
  getOrderByClause() {
    return 'e.title ASC';
  }
}

/**
 * Sort By Capacity: Largest venue capacity first (DESC)
 */
class SortByCapacityStrategy extends EventSortStrategy {
  getOrderByClause() {
    return 'e.capacity DESC, e.date ASC';
  }
}

/**
 * Context: EventQueryContext
 * Configures queries using interchangeable sorting strategies.
 */
class EventQueryContext {
  constructor(strategy = new SortByDateStrategy()) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  getOrderByClause() {
    return this.strategy.getOrderByClause();
  }

  /**
   * Helper factory to resolve strategy by query parameter string
   */
  static resolveStrategy(sortBy) {
    switch (sortBy ? sortBy.toLowerCase() : '') {
      case 'title':
        return new SortByTitleStrategy();
      case 'capacity':
        return new SortByCapacityStrategy();
      case 'date':
      default:
        return new SortByDateStrategy();
    }
  }
}

module.exports = {
  EventSortStrategy,
  SortByDateStrategy,
  SortByTitleStrategy,
  SortByCapacityStrategy,
  EventQueryContext
};
