describe('homepage', function() {
  var ptor;
  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  it('should load homepage', function() {
    browser.get('#/dsfsdfsdfsdf');
    expect(browser.getLocationAbsUrl()).toMatch("#/app/home");
    var button_synchro = by.css('.tasks-section');
    expect(ptor.isElementPresent(button_synchro)).toBe(true);
  });

  it('show login form if first connexion', function() {
    var username = by.model('loginData.username');
    var password = by.model('loginData.password');
    var submit_button = by.css('form button');

    expect(ptor.isElementPresent(username)).toBe(true);
    expect(ptor.isElementPresent(password)).toBe(true);
    expect(ptor.isElementPresent(submit_button)).toBe(true);
  });

  it('with wrong values, submit should fire error', function() {
    element(by.model('loginData.username')).sendKeys('example');
    element(by.model('loginData.password')).sendKeys('example');
    element(by.css('form button')).click().then(function(){
        var error_element = by.css('.login-error');
        expect(ptor.isElementPresent(error_element)).toBe(true);  
    });
  });

  it('with good values, submit should be good and load data', function() {
    element(by.model('loginData.username')).clear().sendKeys('admin');
    element(by.model('loginData.password')).clear().sendKeys('admin');
    element(by.css('form button')).click().then(function(){
      var error_element = by.css('.login-error');
      expect(ptor.isElementPresent(error_element)).toBe(false);
    });
  }); 
});
