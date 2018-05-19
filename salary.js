/*
 * This is Japanese businessmen's salary Calculator.
 *   これは、日本のビジネスマンのための給与計算スクリプトです。
 *
 * This JavaScript code is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 * 
 *  A Quick Guide to GPLv3
 *  https://www.gnu.org/licenses/quick-guide-gplv3.en.html
 * 
 *  GNU PUBLIC LICENSEについての日本語ガイドは以下になります。
 *  GPLv3クイック・ガイド
 *  https://www.gnu.org/licenses/quick-guide-gplv3.html
 * 
 * 配偶者控除詳細計算未対応
 * 
 * Version 0.2 May 19, 2018 基礎控除、計算漏れ修正、会社支払額表示追加
 *
 * Version 0.1 May 14, 2018 初回リリース
 *
 *  XEVENUS LLC Copyright 2018
 */



$(function() {
	// 
	var dependensRow = 0;

	// 基礎控除
	var basicDeduction = 380000;

	// 配偶者控除
	var spouseDeduction = 0;

	$('#basicDeduction').text(number_format(380000));

	$('#append_dependents').click(function() {
		insertTableRow($('#incrementable_' + dependensRow), (dependensRow + 1));
		dependensRow++;
	});
	
	$('#spouse').click(function() {
		if ($('#spouse').is(':checked') == true) {
			spouseDeduction = 380000;
		} else {
			spouseDeduction = 0;
		}
		$('#spouseDeduction').text(number_format(spouseDeduction));
	});
	
	
	$('#exec_calc').click(function() {
		
		// 基本給
		var basicSalaryInput = $('#basicSalaryInput').val() == '' ? 100000 : $('#basicSalaryInput').val();
		basicSalaryInput = parseInt(basicSalaryInput);

		// 残業手当
		var overtimePaymentInput = $('#overtimePaymentInput').val() == '' ? 0 : $('#overtimePaymentInput').val();
		overtimePaymentInput = parseInt(overtimePaymentInput);

		// 手当１
		var benefitInput1 = $('#benefitInput1').val() == '' ? 0 : $('#benefitInput1').val();
		benefitInput1 = parseInt(benefitInput1);

		// 手当２
		var benefitInput2 = $('#benefitInput2').val() == '' ? 0 : $('#benefitInput2').val();
		benefitInput2 = parseInt(benefitInput2);

		// 賞与予定額
		var scheduledBonus = $('#scheduledBonus').val() == '' ? 0 : $('#scheduledBonus').val();
		scheduledBonus = parseInt(scheduledBonus);

		// 支給総額（月額）
		var paymentAmount = parseInt(basicSalaryInput + overtimePaymentInput + benefitInput1 + benefitInput2);
		$('#paymentAmount').text(number_format(paymentAmount));

		// 年収計算
		var annualIncome = parseInt(paymentAmount * 12 + scheduledBonus);
		$('#annualIncome').text(number_format(annualIncome));

		// 厚生年金保険料
		var socialSecurity = calcSocailSecurity(paymentAmount);
		$('#socialSecurity').text(number_format(socialSecurity));

		// 雇用保険料
		var unemploymentInsurance = calcUnemploymentInsurance(paymentAmount);
		$('#unemploymentInsurance').text(number_format(unemploymentInsurance));

		// 健康保険料
		var healthInsurance = calcHealthInsurance(paymentAmount);
		$('#healthInsurance').text(number_format(healthInsurance));

		// 所得控除額計算（月額）
		var incomeDeduction = socialSecurity + unemploymentInsurance + healthInsurance;

		// 年間社会保険料合計
		var annualSocialSecurity = incomeDeduction * 12;
		$('#socialScurityTotal').text(number_format(annualSocialSecurity));

		// 年間支給総額（人件費的な）
		var monthlyPayment = parseInt(paymentAmount + socialSecurity + healthInsurance);
		monthlyPayment += parseInt(unemploymentInsurance) * 2;
		var annualCost = parseInt(monthlyPayment) * 12;
		$('#annualCost').text(number_format(annualCost));

		// 課税所得標準額（月額）
		var taxableIncome = paymentAmount - incomeDeduction;
		$('#taxableIncome').text(number_format(taxableIncome));

		// 給与所得控除計算
		var salaryIncomeDeduction = calcSalaryIncomeDeduction(annualIncome);
console.log('salaryIncomeDeduction = ' + salaryIncomeDeduction);
		$('#salaryIncomeDeduction').text(number_format(salaryIncomeDeduction));

		// 社会保険料控除後の給与所得控除額のマイナス = 年間課税所得額
		annualTaxableIncome = parseInt(annualIncome - basicDeduction - salaryIncomeDeduction - annualSocialSecurity);
// console.log('annualIncome = ' + annualIncome);

		// 所得控除 -------------------------------
		// 扶養控除
		var dependents1 = $('#dependents1').val() == '' ? 0 : $('#dependents1').val();
		dependents1 = parseInt(dependents1);
		var dependents2 = $('#dependents2').val() == '' ? 0 : $('#dependents2').val();
		dependents2 = parseInt(dependents2);
		var dependents3 = $('#dependents3').val() == '' ? 0 : $('#dependents3').val();
		dependents3 = parseInt(dependents3);
		var dependents4 = $('#dependents4').val() == '' ? 0 : $('#dependents4').val();
		dependents4 = parseInt(dependents4);

		var birthday = new Date();
		var dependentsDeduction = calcDependentsDeduction(dependents1, dependents2, dependents3, dependents4);
console.log('dependentsDeduction = ' + dependentsDeduction);
		
		// 所得税計算前 年間課税所得額
		annualTaxableIncome -= spouseDeduction;
console.log('spouseDeduction = ' + spouseDeduction);
		annualTaxableIncome -= dependentsDeduction;
console.log('annualTaxableIncome = ' + annualTaxableIncome);
		$('#annualTaxableIncome').text(number_format(annualTaxableIncome));
		
		// 所得税
		var annualIncomeTax = calcIncomeTax(annualTaxableIncome);
		var incomeTax = parseInt((annualIncomeTax / 12));
		$('#incomeTax').text(number_format(incomeTax));

		// 住民税
		var residentTax = calcResidentTax(taxableIncome);
		$('#residentTax').text(number_format(residentTax));

		// 支払総額
		var aftertaxIncome = taxableIncome - incomeTax - residentTax;
		$('#aftertaxIncome').text(number_format(aftertaxIncome));

	});

});

// 数値整形（カンマ表示）
function number_format(num) {
	return num.toString().replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g , '$1,');
}

// 厚生年金保険料金額計算
function calcSocailSecurity(paymentAmount)
{
	var result = paymentAmount;

	// TODO 
	// Too many numbers in table

	
	result = result * 0.1;

	return result;
}

// 雇用保険料金額計算
function calcUnemploymentInsurance(paymentAmount)
{
	var result = parseInt(paymentAmount);

	// Un enplayment Insurance is 3 / 1000
	// refer the Health Labor Ministry
	result = result * 0.003;
	result = Math.floor(result);

	return result;
}

// 健康保険料
//  地方自治体によって微妙に異なる
function calcHealthInsurance(paymentAmount)
{
	var result = parseInt(paymentAmount);

	// TODO 
	// Too many numbers in table
	
	result = result * 0.1;

	return result;
}

// 給与所得控除
function calcSalaryIncomeDeduction(taxableIncome)
{
	var salaryIncomeDeduction = 0;

	// 給与所得控除額の判定
	if (taxableIncome <= 1800000) {
		salaryIncomeDeduction = taxableIncome * 0.4;
		if (salaryIncomeDeduction < 650000) {
			salaryIncomeDeduction = 650000;
		}
	} else if (1800000 < taxableIncome && taxableIncome <= 3600000) {
		salaryIncomeDeduction = taxableIncome * 0.3;
		// salaryIncomeDeduction = salaryIncomeDeduction + 180000;
		salaryIncomeDeduction += 180000;
	} else if (3600000 < taxableIncome && taxableIncome <= 6600000) {
		salaryIncomeDeduction = taxableIncome * 0.2;
		salaryIncomeDeduction += 540000;
	} else if (6600000 < taxableIncome && taxableIncome <= 10000000) {
		salaryIncomeDeduction = taxableIncome * 0.1;
		salaryIncomeDeduction += 1200000;
	} else if (10000000 < taxableIncome)  {
		salaryIncomeDeduction = 2200000;
	}

	if (salaryIncomeDeduction < 0) salaryIncomeDeduction = 0;

	return salaryIncomeDeduction;
}


// 年間所得税計算
function calcIncomeTax(taxable_income)
{
	var deduction = 0;
	
	//所得税率、控除額の判定
	if (taxable_income <= 1950000) {
		income_tax_rate = 5;
		deduction = 0;
	} else if (1950000 < taxable_income && taxable_income <= 3300000) {
		income_tax_rate = 10;
		deduction = 97500;
	} else if (3300000 < taxable_income && taxable_income <= 6950000) {
		income_tax_rate = 20;
		deduction = 427500;
	} else if (6950000 < taxable_income && taxable_income <= 9000000) {
		income_tax_rate = 23;
		deduction = 636000;
	} else if (9000000 < taxable_income && taxable_income <= 18000000) {
		income_tax_rate = 33;
		deduction = 1536000;
	} else if (18000000 < taxable_income && taxable_income <= 40000000) {
		income_tax_rate = 40;
		deduction = 2796000;
	} else {
		income_tax_rate = 45;
		deduction = 4796000;
	}

	//税額計算
	var income_tax = Math.floor(taxable_income * (income_tax_rate / 100) - deduction);
	
	if (income_tax < 0) {
		income_tax = 0;
	}
	
	return income_tax;
}

// 住民税計算
function calcResidentTax(taxable_income)
{
	var resident_tax = Math.floor(taxable_income / 10);
	
	return resident_tax;
}


// 健康保険料計算
function calcPublicMedicalInsurance(taxable_income, familyCount)
{
	// 保険料算定基準額
	var standard = parseInt(taxable_income) - 330000;

	// 所得割保険料率
	var medicalRate = parseFloat(6.86);       // 医療分
	var afterAgedRate = parseFloat(2.02);     // 後期高齢者支援金分
	var careRate = parseFloat(1.53);          // 介護分

	// 均等割
	var medicalBasic = 35400;
	var careBasic = 14700;
	var afterAgedBasic = 10800;

	// 世帯限度額
	var medicalMaximum = 540000;
	var afterAgedMaximum = 190000;
	var careMaximum = 160000;

	// 限度額チェック
	var medicalCharge = Math.floor(standard * (medicalRate / 100)) + medicalBasic;
	if (medicalCharge > medicalMaximum) {
		medicalCharge = medicalMaximum;
	}
	var afterAgedCharge = Math.floor(standard * (afterAgedRate / 100)) + afterAgedBasic;
	if (afterAgedCharge > afterAgedMaximum) {
		afterAgedCharge = afterAgedMaximum;
	}
	var careCharge = Math.floor(standard * (careRate / 100)) + careBasic;
	if (careCharge > careMaximum) {
		careCharge = careMaximum;
	}
	
	var chargeByIncome = medicalCharge + afterAgedCharge + careCharge;
	var chargeByBasic = familyCount * (medicalBasic + careBasic + afterAgedBasic);

	var totalCharge = chargeByIncome + chargeByBasic;

	return totalCharge;
}


/*********************************************************
  一般の控除対象扶養親族（※1）             38万円
  特定扶養親族（※2）                       63万円
  老人扶養親族（※3）   同居老親等以外の者  48万円
  同居老親等（※4）                         58万円

※1 「控除対象扶養親族」とは、扶養親族のうち、
       その年12月31日現在の年齢が16歳以上の人をいいます。

※2 特定扶養親族とは、控除対象扶養親族のうち、
      その年12月31日現在の年齢が19歳以上23歳未満の人をいいます。

※3 老人扶養親族とは、控除対象扶養親族のうち、
      その年12月31日現在の年齢が70歳以上の人をいいます。

※4 同居老親等とは、老人扶養親族のうち、納税者又はその配偶者の直系の尊属（父母・祖父母など）で、
      納税者又はその配偶者と常に同居している人をいいます。

※5 同居老親等の「同居」については、病気の治療のため入院していることにより
      納税者等と別居している場合は、その期間が結果として1年以上といった長期
     にわたるような場合であっても、同居に該当するものとして取り扱って差し支えありません。
     ただし、老人ホーム等へ入所している場合には、その老人ホームが居所となり、
     同居しているとはいえません。
**********************************************************/
// 扶養家族控除計算  所得控除
function calcDependentsDeduction(dependents1, dependents2, dependents3, dependents4)
{
	// TODO 
	// We need several input box for dependents birthday.
    //  
	var dp = parseInt(dependents1) * 380000;

	dp += parseInt(dependents2) * 630000;
	dp += parseInt(dependents3) * 480000;
	dp += parseInt(dependents4) * 580000;

	return dp;
}



