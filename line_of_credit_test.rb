require 'date'

class Credit
  def initialize (apr, limit)
    @apr = apr/100.00
    @limit = limit
    @balance = 0
    @startDate = Date.today
    @lastTrans = @startDate
    @principal = Hash.new
  end

  def withdraw (amt)
    if amt > @limit
      puts "Insufficient funds"
    else
      daysSinceTrans = Date.today-@lastTrans
      @principal[daysSinceTrans] = @balance
      @limit -= amt
      @balance += amt
      @lastTrans = Date.today
    end
  end

  def makePayment (amt)
    daysSinceTrans = Date.today-@lastTrans
    @principal[daysSinceTrans] = @balance
    @limit += amt
    @balance -= amt
    @lastTrans = Date.today
  end

  def calcInterest () # to be run every 30 days
    totalPayment = @balance
    daysSinceTrans = Date.today-@lastTrans
    @principal[daysSinceTrans] = @balance
    @principal.each do |days, amt|
      totalPayment+= (amt * apr / 365 * days).round(2)
    end
    @startDate = Date.today
    totalPayment
  end


end
