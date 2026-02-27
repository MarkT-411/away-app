#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Motorbike Fan App
Tests all CRUD operations, data persistence, and toggle functionality
"""

import requests
import json
import uuid
from datetime import datetime
import sys

# Backend URL from frontend .env
BACKEND_URL = "https://moto-adventure-app.preview.emergentagent.com/api"

class MotorbikeAppTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_data = {}
        self.failed_tests = []
        self.passed_tests = []
        
    def log_result(self, test_name, success, message=""):
        if success:
            self.passed_tests.append(f"✅ {test_name}")
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append(f"❌ {test_name}: {message}")
            print(f"❌ {test_name}: {message}")
    
    def make_request(self, method, endpoint, data=None, params=None):
        """Make HTTP request with error handling"""
        url = f"{BACKEND_URL}{endpoint}"
        try:
            if method.upper() == "GET":
                response = self.session.get(url, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, params=params)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, params=params)
            
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def test_health_check(self):
        """Test basic connectivity"""
        print("\n=== HEALTH CHECK ===")
        
        response = self.make_request("GET", "/")
        if response and response.status_code == 200:
            self.log_result("API Root Endpoint", True)
        else:
            self.log_result("API Root Endpoint", False, f"Status: {response.status_code if response else 'No response'}")
        
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            self.log_result("Health Check Endpoint", True)
        else:
            self.log_result("Health Check Endpoint", False, f"Status: {response.status_code if response else 'No response'}")

    def test_posts_api(self):
        """Test Posts API - Create, Read, Like, Delete"""
        print("\n=== POSTS API TESTING ===")
        
        # Test data
        user_id = str(uuid.uuid4())
        username = "biker_mike"
        
        # 1. Create a post
        post_data = {
            "user_id": user_id,
            "username": username,
            "content": "Just finished an amazing ride through the mountains! The weather was perfect and the views were incredible. Can't wait for the next adventure! 🏍️",
            "image": None
        }
        
        response = self.make_request("POST", "/posts", post_data)
        if response and response.status_code == 200:
            post = response.json()
            self.test_data['post_id'] = post['id']
            self.log_result("Create Post", True)
        else:
            self.log_result("Create Post", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # 2. Get all posts
        response = self.make_request("GET", "/posts")
        if response and response.status_code == 200:
            posts = response.json()
            if len(posts) > 0 and any(p['id'] == self.test_data['post_id'] for p in posts):
                self.log_result("Get All Posts", True)
            else:
                self.log_result("Get All Posts", False, "Created post not found in list")
        else:
            self.log_result("Get All Posts", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 3. Get specific post
        response = self.make_request("GET", f"/posts/{self.test_data['post_id']}")
        if response and response.status_code == 200:
            post = response.json()
            if post['content'] == post_data['content']:
                self.log_result("Get Specific Post", True)
            else:
                self.log_result("Get Specific Post", False, "Post content mismatch")
        else:
            self.log_result("Get Specific Post", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 4. Like the post
        like_user_id = str(uuid.uuid4())
        response = self.make_request("POST", f"/posts/{self.test_data['post_id']}/like", params={"user_id": like_user_id})
        if response and response.status_code == 200:
            result = response.json()
            if result.get('liked') == True and like_user_id in result.get('likes', []):
                self.log_result("Like Post", True)
            else:
                self.log_result("Like Post", False, "Like toggle failed")
        else:
            self.log_result("Like Post", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 5. Unlike the post (toggle)
        response = self.make_request("POST", f"/posts/{self.test_data['post_id']}/like", params={"user_id": like_user_id})
        if response and response.status_code == 200:
            result = response.json()
            if result.get('liked') == False and like_user_id not in result.get('likes', []):
                self.log_result("Unlike Post (Toggle)", True)
            else:
                self.log_result("Unlike Post (Toggle)", False, "Unlike toggle failed")
        else:
            self.log_result("Unlike Post (Toggle)", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 6. Delete the post
        response = self.make_request("DELETE", f"/posts/{self.test_data['post_id']}")
        if response and response.status_code == 200:
            self.log_result("Delete Post", True)
        else:
            self.log_result("Delete Post", False, f"Status: {response.status_code if response else 'No response'}")

    def test_events_api(self):
        """Test Events API - Create, Read, Join, Delete"""
        print("\n=== EVENTS API TESTING ===")
        
        # Test data
        organizer_id = str(uuid.uuid4())
        organizer_name = "sarah_rides"
        
        # 1. Create an event
        event_data = {
            "title": "Weekend Mountain Ride",
            "description": "Join us for an epic mountain adventure! We'll be riding through scenic routes with stops at beautiful viewpoints. All skill levels welcome.",
            "location": "Blue Ridge Mountains, NC",
            "date": "2024-02-15",
            "time": "09:00",
            "organizer_id": organizer_id,
            "organizer_name": organizer_name,
            "max_attendees": 10
        }
        
        response = self.make_request("POST", "/events", event_data)
        if response and response.status_code == 200:
            event = response.json()
            self.test_data['event_id'] = event['id']
            self.log_result("Create Event", True)
        else:
            self.log_result("Create Event", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # 2. Get all events
        response = self.make_request("GET", "/events")
        if response and response.status_code == 200:
            events = response.json()
            if len(events) > 0 and any(e['id'] == self.test_data['event_id'] for e in events):
                self.log_result("Get All Events", True)
            else:
                self.log_result("Get All Events", False, "Created event not found in list")
        else:
            self.log_result("Get All Events", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 3. Get specific event
        response = self.make_request("GET", f"/events/{self.test_data['event_id']}")
        if response and response.status_code == 200:
            event = response.json()
            if event['title'] == event_data['title']:
                self.log_result("Get Specific Event", True)
            else:
                self.log_result("Get Specific Event", False, "Event title mismatch")
        else:
            self.log_result("Get Specific Event", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 4. Join the event
        join_user_id = str(uuid.uuid4())
        response = self.make_request("POST", f"/events/{self.test_data['event_id']}/join", params={"user_id": join_user_id})
        if response and response.status_code == 200:
            result = response.json()
            if result.get('joined') == True and join_user_id in result.get('attendees', []):
                self.log_result("Join Event", True)
            else:
                self.log_result("Join Event", False, "Join toggle failed")
        else:
            self.log_result("Join Event", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 5. Leave the event (toggle)
        response = self.make_request("POST", f"/events/{self.test_data['event_id']}/join", params={"user_id": join_user_id})
        if response and response.status_code == 200:
            result = response.json()
            if result.get('joined') == False and join_user_id not in result.get('attendees', []):
                self.log_result("Leave Event (Toggle)", True)
            else:
                self.log_result("Leave Event (Toggle)", False, "Leave toggle failed")
        else:
            self.log_result("Leave Event (Toggle)", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 6. Delete the event
        response = self.make_request("DELETE", f"/events/{self.test_data['event_id']}")
        if response and response.status_code == 200:
            self.log_result("Delete Event", True)
        else:
            self.log_result("Delete Event", False, f"Status: {response.status_code if response else 'No response'}")

    def test_trips_api(self):
        """Test Trips API - Create, Read, Join, Delete"""
        print("\n=== TRIPS API TESTING ===")
        
        # Test data
        organizer_id = str(uuid.uuid4())
        organizer_name = "alex_adventure"
        
        # 1. Create a trip
        trip_data = {
            "title": "Coastal Highway Adventure",
            "description": "Experience the breathtaking coastal highway with stunning ocean views. This is a moderate difficulty ride perfect for intermediate riders.",
            "start_location": "San Francisco, CA",
            "end_location": "Monterey, CA",
            "date": "2024-02-20",
            "time": "08:00",
            "distance": "120 miles",
            "duration": "4 hours",
            "organizer_id": organizer_id,
            "organizer_name": organizer_name,
            "max_participants": 8
        }
        
        response = self.make_request("POST", "/trips", trip_data)
        if response and response.status_code == 200:
            trip = response.json()
            self.test_data['trip_id'] = trip['id']
            self.log_result("Create Trip", True)
        else:
            self.log_result("Create Trip", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # 2. Get all trips
        response = self.make_request("GET", "/trips")
        if response and response.status_code == 200:
            trips = response.json()
            if len(trips) > 0 and any(t['id'] == self.test_data['trip_id'] for t in trips):
                self.log_result("Get All Trips", True)
            else:
                self.log_result("Get All Trips", False, "Created trip not found in list")
        else:
            self.log_result("Get All Trips", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 3. Get specific trip
        response = self.make_request("GET", f"/trips/{self.test_data['trip_id']}")
        if response and response.status_code == 200:
            trip = response.json()
            if trip['title'] == trip_data['title']:
                self.log_result("Get Specific Trip", True)
            else:
                self.log_result("Get Specific Trip", False, "Trip title mismatch")
        else:
            self.log_result("Get Specific Trip", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 4. Join the trip
        join_user_id = str(uuid.uuid4())
        response = self.make_request("POST", f"/trips/{self.test_data['trip_id']}/join", params={"user_id": join_user_id})
        if response and response.status_code == 200:
            result = response.json()
            if result.get('joined') == True and join_user_id in result.get('participants', []):
                self.log_result("Join Trip", True)
            else:
                self.log_result("Join Trip", False, "Join toggle failed")
        else:
            self.log_result("Join Trip", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 5. Leave the trip (toggle)
        response = self.make_request("POST", f"/trips/{self.test_data['trip_id']}/join", params={"user_id": join_user_id})
        if response and response.status_code == 200:
            result = response.json()
            if result.get('joined') == False and join_user_id not in result.get('participants', []):
                self.log_result("Leave Trip (Toggle)", True)
            else:
                self.log_result("Leave Trip (Toggle)", False, "Leave toggle failed")
        else:
            self.log_result("Leave Trip (Toggle)", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 6. Delete the trip
        response = self.make_request("DELETE", f"/trips/{self.test_data['trip_id']}")
        if response and response.status_code == 200:
            self.log_result("Delete Trip", True)
        else:
            self.log_result("Delete Trip", False, f"Status: {response.status_code if response else 'No response'}")

    def test_market_api(self):
        """Test Market API - Create, Read, Filter, Mark Sold, Delete"""
        print("\n=== MARKET API TESTING ===")
        
        # Test data
        seller_id = str(uuid.uuid4())
        seller_name = "gear_guru"
        
        # 1. Create a market item
        item_data = {
            "title": "Vintage Leather Motorcycle Jacket",
            "description": "Classic brown leather motorcycle jacket in excellent condition. Size Large. Features armor inserts and multiple pockets. Perfect for touring or casual rides.",
            "price": 299.99,
            "condition": "like-new",
            "category": "gear",
            "images": [],
            "seller_id": seller_id,
            "seller_name": seller_name,
            "contact_info": "gear_guru@email.com",
            "location": "Austin, TX"
        }
        
        response = self.make_request("POST", "/market", item_data)
        if response and response.status_code == 200:
            item = response.json()
            self.test_data['item_id'] = item['id']
            self.log_result("Create Market Item", True)
        else:
            self.log_result("Create Market Item", False, f"Status: {response.status_code if response else 'No response'}")
            return
        
        # 2. Get all market items
        response = self.make_request("GET", "/market")
        if response and response.status_code == 200:
            items = response.json()
            if len(items) > 0 and any(i['id'] == self.test_data['item_id'] for i in items):
                self.log_result("Get All Market Items", True)
            else:
                self.log_result("Get All Market Items", False, "Created item not found in list")
        else:
            self.log_result("Get All Market Items", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 3. Get market items by category
        response = self.make_request("GET", "/market", params={"category": "gear"})
        if response and response.status_code == 200:
            items = response.json()
            if len(items) > 0 and any(i['id'] == self.test_data['item_id'] for i in items):
                self.log_result("Filter Market Items by Category", True)
            else:
                self.log_result("Filter Market Items by Category", False, "Item not found in category filter")
        else:
            self.log_result("Filter Market Items by Category", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 4. Get specific market item
        response = self.make_request("GET", f"/market/{self.test_data['item_id']}")
        if response and response.status_code == 200:
            item = response.json()
            if item['title'] == item_data['title']:
                self.log_result("Get Specific Market Item", True)
            else:
                self.log_result("Get Specific Market Item", False, "Item title mismatch")
        else:
            self.log_result("Get Specific Market Item", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 5. Mark item as sold
        response = self.make_request("PUT", f"/market/{self.test_data['item_id']}/sold")
        if response and response.status_code == 200:
            self.log_result("Mark Item as Sold", True)
        else:
            self.log_result("Mark Item as Sold", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 6. Verify item is not in unsold items list
        response = self.make_request("GET", "/market")
        if response and response.status_code == 200:
            items = response.json()
            if not any(i['id'] == self.test_data['item_id'] for i in items):
                self.log_result("Sold Item Filtered from Listings", True)
            else:
                self.log_result("Sold Item Filtered from Listings", False, "Sold item still appears in listings")
        else:
            self.log_result("Sold Item Filtered from Listings", False, f"Status: {response.status_code if response else 'No response'}")
        
        # 7. Delete the item
        response = self.make_request("DELETE", f"/market/{self.test_data['item_id']}")
        if response and response.status_code == 200:
            self.log_result("Delete Market Item", True)
        else:
            self.log_result("Delete Market Item", False, f"Status: {response.status_code if response else 'No response'}")

    def test_data_persistence(self):
        """Test data persistence across operations"""
        print("\n=== DATA PERSISTENCE TESTING ===")
        
        # Create multiple items and verify they persist
        user_id = str(uuid.uuid4())
        
        # Create post
        post_data = {
            "user_id": user_id,
            "username": "persistence_tester",
            "content": "Testing data persistence across operations"
        }
        
        response = self.make_request("POST", "/posts", post_data)
        if response and response.status_code == 200:
            post_id = response.json()['id']
            
            # Create event
            event_data = {
                "title": "Persistence Test Event",
                "description": "Testing event persistence",
                "location": "Test Location",
                "date": "2024-03-01",
                "time": "10:00",
                "organizer_id": user_id,
                "organizer_name": "persistence_tester"
            }
            
            response = self.make_request("POST", "/events", event_data)
            if response and response.status_code == 200:
                event_id = response.json()['id']
                
                # Verify both items still exist
                post_response = self.make_request("GET", f"/posts/{post_id}")
                event_response = self.make_request("GET", f"/events/{event_id}")
                
                if (post_response and post_response.status_code == 200 and 
                    event_response and event_response.status_code == 200):
                    self.log_result("Data Persistence Across Operations", True)
                else:
                    self.log_result("Data Persistence Across Operations", False, "Items not persisting")
                
                # Cleanup
                self.make_request("DELETE", f"/posts/{post_id}")
                self.make_request("DELETE", f"/events/{event_id}")
            else:
                self.log_result("Data Persistence Across Operations", False, "Event creation failed")
        else:
            self.log_result("Data Persistence Across Operations", False, "Post creation failed")

    def run_all_tests(self):
        """Run all test suites"""
        print("🏍️  MOTORBIKE FAN APP - BACKEND API TESTING")
        print("=" * 50)
        
        self.test_health_check()
        self.test_posts_api()
        self.test_events_api()
        self.test_trips_api()
        self.test_market_api()
        self.test_data_persistence()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        print(f"\n✅ PASSED TESTS ({len(self.passed_tests)}):")
        for test in self.passed_tests:
            print(f"  {test}")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                print(f"  {test}")
        
        total_tests = len(self.passed_tests) + len(self.failed_tests)
        success_rate = (len(self.passed_tests) / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 SUCCESS RATE: {success_rate:.1f}% ({len(self.passed_tests)}/{total_tests})")
        
        if len(self.failed_tests) == 0:
            print("\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
            return True
        else:
            print(f"\n⚠️  {len(self.failed_tests)} tests failed. Backend needs attention.")
            return False

if __name__ == "__main__":
    tester = MotorbikeAppTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)