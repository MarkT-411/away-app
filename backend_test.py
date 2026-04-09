#!/usr/bin/env python3
"""
AWay App Backend API Testing
Tests the backend API endpoints to verify the app is working correctly
and that all features are FREE (no subscription/membership checks).
"""

import requests
import json
import sys
from datetime import datetime

# API Configuration
BASE_URL = "https://away-iap-preview.preview.emergentagent.com/api"

# Test credentials from /app/memory/test_credentials.md
ADMIN_EMAIL = "admin@away-app.com"
ADMIN_PASSWORD = "AWayAdmin2024!"

class AWayAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.admin_user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        })
        
    def test_health_check(self):
        """Test GET /api/health"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test("Health Check", True, "API is healthy", data)
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_init(self):
        """Test POST /api/admin/init"""
        try:
            response = self.session.get(f"{BASE_URL}/admin/init", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'admin_id' in data:
                    self.admin_user_id = data['admin_id']
                    self.log_test("Admin Initialization", True, f"Admin account ready: {data.get('message', '')}", data)
                    return True
                else:
                    self.log_test("Admin Initialization", False, f"No admin_id in response: {data}")
                    return False
            else:
                self.log_test("Admin Initialization", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Initialization", False, f"Request failed: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test POST /api/auth/login with admin credentials"""
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login", 
                                       json=login_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.admin_user_id = data.get('user_id')
                    self.log_test("Admin Login", True, f"Login successful: {data.get('message', '')}", {
                        'user_id': data.get('user_id'),
                        'username': data.get('username'),
                        'email': data.get('email')
                    })
                    return True
                else:
                    self.log_test("Admin Login", False, f"Login failed: {data.get('message', 'Unknown error')}")
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Request failed: {str(e)}")
            return False
    
    def test_user_data_retrieval(self):
        """Test GET /api/auth/user/{user_id} to verify user data"""
        if not self.admin_user_id:
            self.log_test("User Data Retrieval", False, "No admin user ID available")
            return False
            
        try:
            response = self.session.get(f"{BASE_URL}/auth/user/{self.admin_user_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['id', 'email', 'username']
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("User Data Retrieval", True, f"User data retrieved successfully", {
                        'id': data.get('id'),
                        'email': data.get('email'),
                        'username': data.get('username'),
                        'is_admin': data.get('is_admin', False)
                    })
                    return True
                else:
                    self.log_test("User Data Retrieval", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("User Data Retrieval", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Data Retrieval", False, f"Request failed: {str(e)}")
            return False
    
    def test_posts_endpoint(self):
        """Test GET /api/posts"""
        try:
            response = self.session.get(f"{BASE_URL}/posts", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Posts Endpoint", True, f"Posts retrieved successfully ({len(data)} posts)", {
                        'post_count': len(data),
                        'sample_post': data[0] if data else None
                    })
                    return True
                else:
                    self.log_test("Posts Endpoint", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Posts Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Posts Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def test_events_endpoint(self):
        """Test GET /api/events"""
        try:
            response = self.session.get(f"{BASE_URL}/events", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Events Endpoint", True, f"Events retrieved successfully ({len(data)} events)", {
                        'event_count': len(data),
                        'sample_event': data[0] if data else None
                    })
                    return True
                else:
                    self.log_test("Events Endpoint", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("Events Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Events Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def test_free_access_verification(self):
        """Verify that content endpoints don't require subscription/membership"""
        try:
            # Test multiple endpoints to ensure no paywall
            endpoints_to_test = [
                ("/posts", "Posts"),
                ("/events", "Events"),
                ("/trips", "Trips"),
                ("/market", "Market")
            ]
            
            free_access_results = []
            
            for endpoint, name in endpoints_to_test:
                try:
                    response = self.session.get(f"{BASE_URL}{endpoint}", timeout=10)
                    if response.status_code == 200:
                        free_access_results.append(f"{name}: ✅ FREE ACCESS")
                    elif response.status_code == 402:  # Payment Required
                        free_access_results.append(f"{name}: ❌ PAYWALL DETECTED")
                    elif response.status_code == 403:  # Forbidden (might indicate subscription required)
                        free_access_results.append(f"{name}: ❌ ACCESS RESTRICTED")
                    else:
                        free_access_results.append(f"{name}: ⚠️ HTTP {response.status_code}")
                except Exception as e:
                    free_access_results.append(f"{name}: ❌ ERROR: {str(e)}")
            
            paywall_detected = any("PAYWALL" in result or "RESTRICTED" in result for result in free_access_results)
            
            if not paywall_detected:
                self.log_test("Free Access Verification", True, "All content endpoints are FREE", {
                    'results': free_access_results
                })
                return True
            else:
                self.log_test("Free Access Verification", False, "Paywall or restrictions detected", {
                    'results': free_access_results
                })
                return False
                
        except Exception as e:
            self.log_test("Free Access Verification", False, f"Verification failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("AWay App Backend API Testing")
        print("=" * 60)
        print(f"Testing API at: {BASE_URL}")
        print(f"Admin credentials: {ADMIN_EMAIL}")
        print("=" * 60)
        
        tests = [
            self.test_health_check,
            self.test_admin_init,
            self.test_admin_login,
            self.test_user_data_retrieval,
            self.test_posts_endpoint,
            self.test_events_endpoint,
            self.test_free_access_verification
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL {test.__name__}: Unexpected error: {str(e)}")
            print("-" * 40)
        
        print("=" * 60)
        print(f"TEST SUMMARY: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        print("=" * 60)
        
        # Print detailed results
        print("\nDETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
            if result['response_data'] and isinstance(result['response_data'], dict):
                for key, value in result['response_data'].items():
                    print(f"   {key}: {value}")
        
        return passed == total

if __name__ == "__main__":
    tester = AWayAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)