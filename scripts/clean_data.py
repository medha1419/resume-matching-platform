import re
import sys
from pathlib import Path

import pandas as pd
from bs4 import BeautifulSoup

NOISE_PHRASES = [
    'equal employment opportunity', 'affirmative action',
    'drug-free workplace', 'drug test before beginning',
    'diversity creates', 'application deadline',
    'posted for a minimum', 'pay is based on several factors',
    'we comply with all minimum wage', 'subject to eligibility',
    'no matter where or when you begin', 'flexible paid time off',
    'equity compensation', 'employee stock purchase',
    'growth and development fund', 'parental leave',
    'home office support', 'benefits to support',
    'fortune 500', 'registered trademark',
    'telecommuter policy', 'base salary range does not',
    'we believe everyone', 'our mission is to help',
    'come make an impact', 'join us to start',
    'you will be rewarded',
]

KNOWN_LOCATIONS = [
    'remote', 'india', 'united states', 'usa', 'uk', 'united kingdom',
    'canada', 'singapore', 'australia', 'bangalore', 'bengaluru',
    'delhi', 'new delhi', 'mumbai', 'hyderabad', 'pune', 'chennai',
    'noida', 'gurugram', 'gurgaon', 'kolkata', 'new york',
    'san francisco', 'seattle', 'austin', 'chicago', 'boston',
    'london', 'berlin', 'dubai', 'washington', 'minneapolis',
]

URL_PATTERN = re.compile(r'https?://\S+|www\.\S+')
WHITESPACE_PATTERN = re.compile(r'\s+')
LOCATION_LABEL_PATTERN = re.compile(r'^\s*(primary\s+)?location\s*:', re.IGNORECASE)

SALARY_USD_PATTERN = re.compile(
    r'\$([\d,]+)\s*(?:-|to)\s*\$([\d,]+)', re.IGNORECASE
)
SALARY_LPA_PATTERN = re.compile(
    r'(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*LPA', re.IGNORECASE
)
SALARY_RUPEE_PATTERN = re.compile(
    r'₹([\d,]+)\s*(?:-|to)\s*₹([\d,]+)', re.IGNORECASE
)


def clean_job(raw_html):
    if not raw_html or not isinstance(raw_html, str):
        return None

    soup = BeautifulSoup(raw_html, 'html.parser')

    for tag in soup.find_all(['p', 'li', 'ul', 'div']):
        text = tag.get_text(separator=' ').lower()
        if any(phrase in text for phrase in NOISE_PHRASES):
            tag.decompose()

    text = soup.get_text(separator=' ')
    text = text.replace('&amp;', '&').replace('&nbsp;', ' ').replace('&#39;', "'")
    text = re.sub(r'&[a-zA-Z#0-9]+;', ' ', text)
    text = URL_PATTERN.sub(' ', text)
    text = WHITESPACE_PATTERN.sub(' ', text).strip()

    if len(text) < 80:
        return None

    return text


def extract_location(soup):
    for tag in soup.find_all(['p', 'strong', 'b']):
        text = tag.get_text(separator=' ').strip()
        if LOCATION_LABEL_PATTERN.match(text):
            after_colon = text.split(':', 1)[1].strip() if ':' in text else ''
            if after_colon:
                return after_colon

            sibling = tag.find_next_sibling('ul')
            if sibling:
                items = [li.get_text(separator=' ').strip() for li in sibling.find_all('li')]
                items = [i for i in items if i]
                if items:
                    return ', '.join(items)

    p_tags = soup.find_all('p')[:6]
    for tag in p_tags:
        text = tag.get_text(separator=' ').strip().lower()
        if text in KNOWN_LOCATIONS:
            return text

    return None


def extract_salary(text):
    if not text or not isinstance(text, str):
        return (None, None, None)

    match = SALARY_USD_PATTERN.search(text)
    if match:
        salary_min = int(match.group(1).replace(',', ''))
        salary_max = int(match.group(2).replace(',', ''))
        return (salary_min, salary_max, 'USD')

    match = SALARY_LPA_PATTERN.search(text)
    if match:
        salary_min = int(float(match.group(1)) * 100000)
        salary_max = int(float(match.group(2)) * 100000)
        return (salary_min, salary_max, 'INR')

    match = SALARY_RUPEE_PATTERN.search(text)
    if match:
        salary_min = int(match.group(1).replace(',', ''))
        salary_max = int(match.group(2).replace(',', ''))
        return (salary_min, salary_max, 'INR')

    return (None, None, None)


def process_job(row):
    raw_html = row.get('Job Description')
    job_id = row.get('Job ID')
    job_title = row.get('Job Title')

    clean_description = clean_job(raw_html)

    soup = BeautifulSoup(raw_html, 'html.parser') if raw_html and isinstance(raw_html, str) else None
    location = extract_location(soup) if soup is not None else None

    salary_min, salary_max, currency = extract_salary(raw_html)

    word_count = len(clean_description.split()) if clean_description else 0

    if clean_description is None:
        flag = 'empty'
    elif word_count < 30:
        flag = 'too short'
    else:
        flag = 'ok'

    return {
        'job_id': job_id,
        'job_title': job_title,
        'clean_description': clean_description,
        'location': location,
        'salary_min': salary_min,
        'salary_max': salary_max,
        'currency': currency,
        'word_count': word_count,
        'flag': flag,
    }


def main():
    input_path = Path('data/raw/USER_JOB_DATA.xlsx')
    print(f'Looking for: {input_path}')

    if not input_path.exists():
        print(f'ERROR: {input_path} not found. Place the Excel file in data/raw/ and re-run.')
        sys.exit(1)

    df = pd.read_excel(input_path, sheet_name='Job Data')
    print(f'Columns found: {list(df.columns)}')
    print(f'Total row count: {len(df)}')

    results = df.apply(process_job, axis=1, result_type='expand')

    total_jobs = len(results)
    clean_count = (results['flag'] == 'ok').sum()
    empty_count = (results['flag'] == 'empty').sum()
    too_short_count = (results['flag'] == 'too short').sum()
    salary_count = results['salary_min'].notna().sum()
    location_count = results['location'].notna().sum()
    avg_word_count = results['word_count'].mean()

    print('\n--- Report ---')
    print(f'Total jobs: {total_jobs}')
    print(f'Clean (flag=ok): {clean_count}')
    print(f'Empty (flag=empty): {empty_count}')
    print(f'Too short (flag=too short): {too_short_count}')
    print(f'Salary extracted: {salary_count}')
    print(f'Location found: {location_count}')
    print(f'Average word count: {avg_word_count:.1f}')

    print('\n--- Sample rows ---')
    for _, row in results.head(3).iterrows():
        desc = row['clean_description'] or ''
        print(f"Title: {row['job_title']}")
        print(f"Location: {row['location']}")
        print(f"Salary: {row['salary_min']} - {row['salary_max']} {row['currency']}")
        print(f"Description: {desc[:150]}")
        print('---')

    output_path = Path('data/processed/jobs_clean.csv')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    results.to_csv(output_path, index=False)
    print(f'\nSaved to {output_path}')


if __name__ == '__main__':
    main()
