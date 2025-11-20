"""
Django management command to seed sample data for testing
Usage: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from decimal import Decimal

from users.models import User
from instructors.models import InstructorProfile, Experience, Education
from academies.models import AcademyProfile
from job_postings.models import JobPosting
from applications.models import Application
from reviews.models import Review
from favorites.models import Favorite
from common.models import Term, FAQCategory, FAQ


class Command(BaseCommand):
    help = 'Seed sample data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Review.objects.all().delete()
            Application.objects.all().delete()
            Favorite.objects.all().delete()
            JobPosting.objects.all().delete()
            Experience.objects.all().delete()
            Education.objects.all().delete()
            InstructorProfile.objects.all().delete()
            AcademyProfile.objects.all().delete()
            # 관리자 계정은 제외
            User.objects.exclude(role='admin').delete()
            FAQ.objects.all().delete()
            FAQCategory.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        self.stdout.write(self.style.SUCCESS('Starting to seed data...'))

        # 1. 약관 데이터
        self.create_terms()

        # 2. FAQ 데이터
        self.create_faqs()

        # 3. 강사 사용자 및 프로필
        instructors = self.create_instructors()

        # 4. 학원 사용자 및 프로필
        academies = self.create_academies()

        # 5. 공고 데이터
        job_postings = self.create_job_postings(academies)

        # 6. 지원 데이터
        applications = self.create_applications(instructors, job_postings)

        # 7. 리뷰 데이터
        self.create_reviews(applications)

        # 8. 찜 데이터
        self.create_favorites(instructors, job_postings)

        self.stdout.write(self.style.SUCCESS('Successfully seeded sample data!'))
        self.stdout.write(self.style.SUCCESS(f'Created:'))
        self.stdout.write(f'  - {len(instructors)} instructors')
        self.stdout.write(f'  - {len(academies)} academies')
        self.stdout.write(f'  - {len(job_postings)} job postings')
        self.stdout.write(f'  - {len(applications)} applications')
        self.stdout.write(f'  - {Review.objects.count()} reviews')
        self.stdout.write(f'  - {Favorite.objects.count()} favorites')

    def create_terms(self):
        """약관 데이터 생성"""
        Term.objects.get_or_create(
            type='service',
            defaults={
                'title': '이용약관',
                'content': '''제1조 (목적)
이 약관은 D-Match(이하 "회사")가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 무용 강사와 학원을 연결하는 플랫폼 서비스를 의미합니다.
2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.

[이하 약관 내용...]''',
                'version': '1.0'
            }
        )

        Term.objects.get_or_create(
            type='privacy',
            defaults={
                'title': '개인정보처리방침',
                'content': '''제1조 (개인정보의 처리목적)
회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

1. 회원 가입 및 관리
   - 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적

2. 재화 또는 서비스 제공
   - 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증, 요금결제·정산

[이하 개인정보처리방침 내용...]''',
                'version': '1.0'
            }
        )

    def create_faqs(self):
        """FAQ 데이터 생성"""
        # FAQ 카테고리 생성
        category1, _ = FAQCategory.objects.get_or_create(
            name='회원가입',
            defaults={'order': 1}
        )
        category2, _ = FAQCategory.objects.get_or_create(
            name='공고/지원',
            defaults={'order': 2}
        )
        category3, _ = FAQCategory.objects.get_or_create(
            name='인증',
            defaults={'order': 3}
        )
        category4, _ = FAQCategory.objects.get_or_create(
            name='기타',
            defaults={'order': 4}
        )

        # FAQ 생성
        faqs_data = [
            {
                'category': category1,
                'question': '회원가입은 어떻게 하나요?',
                'answer': '홈페이지 상단의 "회원가입" 버튼을 클릭하신 후, 강사 또는 학원 중 하나를 선택하여 가입하실 수 있습니다. 이메일, 비밀번호, 이름, 전화번호를 입력하시면 됩니다.',
                'order': 1
            },
            {
                'category': category1,
                'question': '강사와 학원을 동시에 가입할 수 있나요?',
                'answer': '아니요, 하나의 계정으로는 강사 또는 학원 중 하나의 역할만 선택할 수 있습니다. 다른 역할로 가입하시려면 다른 이메일로 별도 가입이 필요합니다.',
                'order': 2
            },
            {
                'category': category2,
                'question': '공고는 어떻게 등록하나요?',
                'answer': '학원 계정으로 로그인하신 후, "공고 등록" 메뉴에서 필요한 정보를 입력하시면 됩니다. 등록된 공고는 관리자 검토 후 게시됩니다.',
                'order': 1
            },
            {
                'category': category2,
                'question': '지원은 언제까지 가능한가요?',
                'answer': '공고가 "게시중" 상태일 때만 지원이 가능합니다. 마감된 공고에는 지원할 수 없습니다.',
                'order': 2
            },
            {
                'category': category3,
                'question': '인증은 왜 필요한가요?',
                'answer': '인증을 통해 실제 강사 및 학원임을 확인하여 서비스의 신뢰성을 높이고 있습니다. 인증된 사용자는 더 많은 기능을 이용하실 수 있습니다.',
                'order': 1
            },
            {
                'category': category3,
                'question': '인증 심사는 얼마나 걸리나요?',
                'answer': '인증 서류 제출 후 1-2일 내에 심사가 완료됩니다. 심사 결과는 알림을 통해 안내드립니다.',
                'order': 2
            },
            {
                'category': category4,
                'question': '비밀번호를 잊어버렸어요.',
                'answer': '로그인 페이지의 "비밀번호 찾기"를 클릭하신 후, 등록하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 이메일로 발송해드립니다.',
                'order': 1
            },
        ]

        for faq_data in faqs_data:
            FAQ.objects.get_or_create(
                category=faq_data['category'],
                question=faq_data['question'],
                defaults=faq_data
            )

    def create_instructors(self):
        """강사 사용자 및 프로필 생성"""
        instructors_data = [
            {
                'email': 'instructor1@example.com',
                'name': '김발레',
                'phone': '010-1111-1111',
                'password': 'test123!',
                'specialties': ['ballet', 'contemporary'],
                'bio': '10년 이상의 발레 경력을 가진 전문 강사입니다. 클래식 발레와 현대무용을 전문으로 합니다.',
                'is_verified': True,
                'verification_status': 'approved',
                'experiences': [
                    {
                        'institution': '서울예술대학교',
                        'position': '전임강사',
                        'start_date': date(2020, 1, 1),
                        'end_date': date(2023, 12, 31),
                        'description': '발레 전공 수업 담당'
                    },
                    {
                        'institution': '국립발레단',
                        'position': '수석무용수',
                        'start_date': date(2015, 1, 1),
                        'end_date': date(2019, 12, 31),
                        'description': '주요 작품 무용수로 활동'
                    }
                ],
                'educations': [
                    {
                        'school': '서울예술대학교',
                        'major': '무용학과',
                        'degree': 'bachelor',
                        'start_date': date(2011, 3, 1),
                        'end_date': date(2015, 2, 28),
                        'description': '발레 전공'
                    }
                ]
            },
            {
                'email': 'instructor2@example.com',
                'name': '이현대',
                'phone': '010-2222-2222',
                'password': 'test123!',
                'specialties': ['contemporary', 'korean'],
                'bio': '현대무용과 한국무용을 융합한 독특한 스타일의 강사입니다.',
                'is_verified': True,
                'verification_status': 'approved',
                'experiences': [
                    {
                        'institution': '한국예술종합학교',
                        'position': '겸임교수',
                        'start_date': date(2021, 3, 1),
                        'end_date': None,
                        'description': '현대무용 전공 수업'
                    }
                ],
                'educations': [
                    {
                        'school': '한국예술종합학교',
                        'major': '무용원',
                        'degree': 'master',
                        'start_date': date(2016, 3, 1),
                        'end_date': date(2018, 2, 28),
                        'description': '현대무용 전공'
                    }
                ]
            },
            {
                'email': 'instructor3@example.com',
                'name': '박재즈',
                'phone': '010-3333-3333',
                'password': 'test123!',
                'specialties': ['jazz', 'hiphop'],
                'bio': '재즈댄스와 힙합을 전문으로 하는 에너지 넘치는 강사입니다.',
                'is_verified': False,
                'verification_status': 'pending',
                'experiences': [],
                'educations': []
            },
            {
                'email': 'instructor4@example.com',
                'name': '최한국',
                'phone': '010-4444-4444',
                'password': 'test123!',
                'specialties': ['korean'],
                'bio': '한국무용의 전통을 현대적으로 계승하는 강사입니다.',
                'is_verified': True,
                'verification_status': 'approved',
                'experiences': [
                    {
                        'institution': '국립국악원',
                        'position': '연구원',
                        'start_date': date(2018, 1, 1),
                        'end_date': date(2020, 12, 31),
                        'description': '한국무용 연구 및 공연'
                    }
                ],
                'educations': [
                    {
                        'school': '이화여자대학교',
                        'major': '한국무용과',
                        'degree': 'bachelor',
                        'start_date': date(2014, 3, 1),
                        'end_date': date(2018, 2, 28),
                        'description': '한국무용 전공'
                    }
                ]
            },
            {
                'email': 'instructor5@example.com',
                'name': '정볼룸',
                'phone': '010-5555-5555',
                'password': 'test123!',
                'specialties': ['ballroom'],
                'bio': '볼룸댄스 대회 수상 경력이 있는 전문 강사입니다.',
                'is_verified': True,
                'verification_status': 'approved',
                'experiences': [],
                'educations': []
            }
        ]

        instructors = []
        for data in instructors_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'name': data['name'],
                    'phone': data['phone'],
                    'role': 'instructor',
                    'is_verified': data['is_verified'],
                    'verification_status': data['verification_status']
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()

            profile, _ = InstructorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'specialties': data['specialties'],
                    'bio': data['bio']
                }
            )

            # 경력 추가
            for exp_data in data['experiences']:
                Experience.objects.get_or_create(
                    instructor=profile,
                    institution=exp_data['institution'],
                    position=exp_data['position'],
                    start_date=exp_data['start_date'],
                    defaults={
                        'end_date': exp_data.get('end_date'),
                        'description': exp_data.get('description', '')
                    }
                )

            # 학력 추가
            for edu_data in data['educations']:
                Education.objects.get_or_create(
                    instructor=profile,
                    school=edu_data['school'],
                    major=edu_data['major'],
                    degree=edu_data['degree'],
                    start_date=edu_data['start_date'],
                    defaults={
                        'end_date': edu_data.get('end_date'),
                        'description': edu_data.get('description', '')
                    }
                )

            instructors.append(user)

        return instructors

    def create_academies(self):
        """학원 사용자 및 프로필 생성"""
        academies_data = [
            {
                'email': 'academy1@example.com',
                'name': '홍길동',
                'phone': '010-1000-1000',
                'password': 'test123!',
                'academy_name': '서울 발레 아카데미',
                'address': '서울시 강남구 테헤란로 123',
                'phone_academy': '02-1234-5678',
                'operating_hours': '09:00-18:00',
                'main_genres': ['ballet', 'contemporary'],
                'description': '서울 강남에 위치한 전문 발레 학원입니다. 체계적인 커리큘럼과 우수한 강사진을 자랑합니다.',
                'facilities': ['parking', 'shower', 'locker', 'waiting'],
                'latitude': Decimal('37.5665'),
                'longitude': Decimal('126.9780'),
                'is_verified': True,
                'verification_status': 'approved'
            },
            {
                'email': 'academy2@example.com',
                'name': '김학원',
                'phone': '010-2000-2000',
                'password': 'test123!',
                'academy_name': '현대무용 스튜디오',
                'address': '서울시 마포구 홍대입구로 456',
                'phone_academy': '02-2345-6789',
                'operating_hours': '10:00-20:00',
                'main_genres': ['contemporary', 'jazz'],
                'description': '홍대 인근의 현대적인 무용 스튜디오입니다. 자유로운 분위기에서 창의적인 무용을 배울 수 있습니다.',
                'facilities': ['shower', 'locker', 'cafe'],
                'latitude': Decimal('37.5563'),
                'longitude': Decimal('126.9236'),
                'is_verified': True,
                'verification_status': 'approved'
            },
            {
                'email': 'academy3@example.com',
                'name': '이무용',
                'phone': '010-3000-3000',
                'password': 'test123!',
                'academy_name': '한국무용 전수관',
                'address': '서울시 종로구 인사동길 789',
                'phone_academy': '02-3456-7890',
                'operating_hours': '09:00-19:00',
                'main_genres': ['korean'],
                'description': '전통 한국무용을 전문으로 하는 학원입니다. 전통의 맥을 이어가는 우수한 강사진이 있습니다.',
                'facilities': ['parking', 'waiting'],
                'latitude': Decimal('37.5735'),
                'longitude': Decimal('126.9788'),
                'is_verified': False,
                'verification_status': 'pending'
            },
            {
                'email': 'academy4@example.com',
                'name': '박댄스',
                'phone': '010-4000-4000',
                'password': 'test123!',
                'academy_name': '힙합 댄스 아카데미',
                'address': '서울시 강동구 천호대로 321',
                'phone_academy': '02-4567-8901',
                'operating_hours': '14:00-22:00',
                'main_genres': ['hiphop', 'jazz'],
                'description': '힙합과 재즈댄스를 전문으로 하는 학원입니다. 젊고 역동적인 분위기에서 즐겁게 배울 수 있습니다.',
                'facilities': ['shower', 'locker'],
                'latitude': Decimal('37.5384'),
                'longitude': Decimal('127.1238'),
                'is_verified': True,
                'verification_status': 'approved'
            }
        ]

        academies = []
        for data in academies_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'name': data['name'],
                    'phone': data['phone'],
                    'role': 'academy',
                    'is_verified': data['is_verified'],
                    'verification_status': data['verification_status']
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()

            AcademyProfile.objects.get_or_create(
                user=user,
                defaults={
                    'academy_name': data['academy_name'],
                    'address': data['address'],
                    'phone': data['phone_academy'],
                    'operating_hours': data['operating_hours'],
                    'main_genres': data['main_genres'],
                    'description': data['description'],
                    'facilities': data['facilities'],
                    'latitude': data['latitude'],
                    'longitude': data['longitude']
                }
            )

            academies.append(user)

        return academies

    def create_job_postings(self, academies):
        """공고 데이터 생성"""
        job_postings_data = [
            {
                'academy': academies[0],
                'title': '주말 발레 강사 모집',
                'region': 'seoul',
                'district': '강남구',
                'genres': ['ballet'],
                'classes': '초등반, 성인취미반',
                'work_days': ['saturday', 'sunday'],
                'work_time': '14:00-18:00',
                'salary_type': 'hourly',
                'salary': 50000,
                'preferred_qualifications': '경력 3년 이상, 발레 전공자 우대',
                'description': '주말에 발레 수업을 담당해주실 강사를 모집합니다. 초등반과 성인취미반을 담당하시면 됩니다.',
                'address': '서울시 강남구 테헤란로 123',
                'latitude': Decimal('37.5665'),
                'longitude': Decimal('126.9780'),
                'status': 'active'
            },
            {
                'academy': academies[0],
                'title': '평일 저녁 발레 강사 모집',
                'region': 'seoul',
                'district': '강남구',
                'genres': ['ballet'],
                'classes': '중등반, 고등반',
                'work_days': ['monday', 'wednesday', 'friday'],
                'work_time': '19:00-21:00',
                'salary_type': 'hourly',
                'salary': 60000,
                'preferred_qualifications': '경력 5년 이상, 전문 발레 교육 경험',
                'description': '평일 저녁 시간대에 중등반과 고등반 발레 수업을 담당해주실 강사를 모집합니다.',
                'address': '서울시 강남구 테헤란로 123',
                'latitude': Decimal('37.5665'),
                'longitude': Decimal('126.9780'),
                'status': 'active'
            },
            {
                'academy': academies[1],
                'title': '현대무용 강사 모집',
                'region': 'seoul',
                'district': '마포구',
                'genres': ['contemporary'],
                'classes': '성인반',
                'work_days': ['tuesday', 'thursday'],
                'work_time': '19:00-21:00',
                'salary_type': 'hourly',
                'salary': 55000,
                'preferred_qualifications': '현대무용 전공, 창의적인 수업 진행 가능',
                'description': '성인 대상 현대무용 수업을 담당해주실 강사를 모집합니다.',
                'address': '서울시 마포구 홍대입구로 456',
                'latitude': Decimal('37.5563'),
                'longitude': Decimal('126.9236'),
                'status': 'active'
            },
            {
                'academy': academies[1],
                'title': '재즈댄스 주말 강사 모집',
                'region': 'seoul',
                'district': '마포구',
                'genres': ['jazz'],
                'classes': '초등반, 중등반',
                'work_days': ['saturday'],
                'work_time': '10:00-13:00',
                'salary_type': 'hourly',
                'salary': 45000,
                'preferred_qualifications': '재즈댄스 경력 2년 이상',
                'description': '주말 오전 시간에 재즈댄스 수업을 담당해주실 강사를 모집합니다.',
                'address': '서울시 마포구 홍대입구로 456',
                'latitude': Decimal('37.5563'),
                'longitude': Decimal('126.9236'),
                'status': 'active'
            },
            {
                'academy': academies[2],
                'title': '한국무용 강사 모집',
                'region': 'seoul',
                'district': '종로구',
                'genres': ['korean'],
                'classes': '전통무용반',
                'work_days': ['monday', 'wednesday', 'friday'],
                'work_time': '15:00-17:00',
                'salary_type': 'monthly',
                'salary': 3000000,
                'preferred_qualifications': '한국무용 전공, 전통무용 경력',
                'description': '전통 한국무용을 가르쳐주실 강사를 모집합니다.',
                'address': '서울시 종로구 인사동길 789',
                'latitude': Decimal('37.5735'),
                'longitude': Decimal('126.9788'),
                'status': 'pending'
            },
            {
                'academy': academies[3],
                'title': '힙합 댄스 강사 모집',
                'region': 'seoul',
                'district': '강동구',
                'genres': ['hiphop'],
                'classes': '청소년반, 성인반',
                'work_days': ['tuesday', 'thursday', 'saturday'],
                'work_time': '18:00-20:00',
                'salary_type': 'hourly',
                'salary': 50000,
                'preferred_qualifications': '힙합 댄스 경력, 대회 수상 경력 우대',
                'description': '힙합 댄스 수업을 담당해주실 강사를 모집합니다.',
                'address': '서울시 강동구 천호대로 321',
                'latitude': Decimal('37.5384'),
                'longitude': Decimal('127.1238'),
                'status': 'active'
            },
            {
                'academy': academies[3],
                'title': '재즈댄스 저녁 강사 모집',
                'region': 'seoul',
                'district': '강동구',
                'genres': ['jazz'],
                'classes': '성인반',
                'work_days': ['monday', 'wednesday'],
                'work_time': '19:00-21:00',
                'salary_type': 'hourly',
                'salary': 55000,
                'preferred_qualifications': '재즈댄스 전문가',
                'description': '저녁 시간대 재즈댄스 수업을 담당해주실 강사를 모집합니다.',
                'address': '서울시 강동구 천호대로 321',
                'latitude': Decimal('37.5384'),
                'longitude': Decimal('127.1238'),
                'status': 'closed'
            }
        ]

        job_postings = []
        for data in job_postings_data:
            posting = JobPosting.objects.create(**data)
            job_postings.append(posting)

        return job_postings

    def create_applications(self, instructors, job_postings):
        """지원 데이터 생성"""
        applications_data = [
            {
                'instructor': instructors[0],
                'job_posting': job_postings[0],
                'status': 'accepted'
            },
            {
                'instructor': instructors[1],
                'job_posting': job_postings[0],
                'status': 'reviewing'
            },
            {
                'instructor': instructors[0],
                'job_posting': job_postings[2],
                'status': 'accepted'
            },
            {
                'instructor': instructors[2],
                'job_posting': job_postings[3],
                'status': 'pending'
            },
            {
                'instructor': instructors[3],
                'job_posting': job_postings[5],
                'status': 'reviewing'
            },
            {
                'instructor': instructors[4],
                'job_posting': job_postings[5],
                'status': 'rejected',
                'rejection_reason': '경력 부족'
            }
        ]

        applications = []
        for data in applications_data:
            application, created = Application.objects.get_or_create(
                instructor=data['instructor'],
                job_posting=data['job_posting'],
                defaults={
                    'status': data['status'],
                    'rejection_reason': data.get('rejection_reason', '')
                }
            )
            applications.append(application)

        return applications

    def create_reviews(self, applications):
        """리뷰 데이터 생성"""
        # 채용 확정된 지원에 대해서만 리뷰 생성
        accepted_applications = [app for app in applications if app.status == 'accepted']

        reviews_data = [
            {
                'application': accepted_applications[0],
                'author': accepted_applications[0].instructor,
                'academy': accepted_applications[0].job_posting.academy,
                'rating': 5,
                'content': '수업 분위기가 좋고 시설도 깔끔합니다. 학생들도 열정적이어서 수업하기 좋습니다.'
            },
            {
                'application': accepted_applications[0],
                'author': accepted_applications[0].job_posting.academy,
                'instructor': accepted_applications[0].instructor,
                'rating': 5,
                'content': '전문성이 뛰어나고 학생들과의 소통도 원활합니다. 매우 만족합니다.'
            },
            {
                'application': accepted_applications[1],
                'author': accepted_applications[1].instructor,
                'academy': accepted_applications[1].job_posting.academy,
                'rating': 4,
                'content': '좋은 학원입니다. 다만 주차 공간이 좀 부족한 편이에요.'
            },
            {
                'application': accepted_applications[1],
                'author': accepted_applications[1].job_posting.academy,
                'instructor': accepted_applications[1].instructor,
                'rating': 5,
                'content': '수업 준비를 철저히 하시고 학생들을 잘 이끌어주십니다.'
            }
        ]

        for review_data in reviews_data:
            Review.objects.get_or_create(
                application=review_data['application'],
                author=review_data['author'],
                defaults={
                    'instructor': review_data.get('instructor'),
                    'academy': review_data.get('academy'),
                    'rating': review_data['rating'],
                    'content': review_data['content']
                }
            )

    def create_favorites(self, instructors, job_postings):
        """찜 데이터 생성"""
        favorites_data = [
            {'instructor': instructors[0], 'job_posting': job_postings[1]},
            {'instructor': instructors[0], 'job_posting': job_postings[3]},
            {'instructor': instructors[1], 'job_posting': job_postings[1]},
            {'instructor': instructors[2], 'job_posting': job_postings[5]},
        ]

        for fav_data in favorites_data:
            Favorite.objects.get_or_create(**fav_data)

