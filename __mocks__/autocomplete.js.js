const autocomplete = jest.fn(() => {
  document.querySelector('input').classList.add('ap-input');
  let query = 'query';

  const instance = {
    on: jest.fn(),
    focus: jest.fn(),
    val: jest.fn(() => query),
    autocomplete: {
      setVal: jest.fn(),
      getVal: jest.fn(),
      open: jest.fn(),
      close: jest.fn(),
      destroy: jest.fn(),
    },
  };
  autocomplete.__instance = instance;
  autocomplete.__setQuery = q => {
    query = q;
  };
  return instance;
});

export default autocomplete;
