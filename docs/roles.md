for staff role we have these sub roles
cheff, janitor, security.
following is the allowed action that a person can do in the system
customer
-> login/signup
-> do visit booking to the property (it is used by the customer to tell the property manager | staff that i will visit to check the room and properties with date and time)
-> book a room of the property (with or without food based on the weather food is provided in the property and he|she want it or not) + booking charge (if applicable provided in the property data)
-> pay monthly rental based on the rental price of the room.
-> can raise ticket to show concern to the property manager or staffs
-> can close the booking if the customer want to cancel the booking (in case he is moving off the property)

manager
-> login
-> can add, update, delete properties
-> can add, update, delete rooms
-> can add, update, suspend bookings
-> can add, update payments
-> can add, update close tickets
-> can add, update notifications
-> can add, update ban|suspend customers
-> can add, update ban|suspend users

property manager (optional role)
-> login
-> can update properties details assigned to him (multiple properties can be assigned to a property manager)
-> can add, update, delete rooms only in the assigned properties
-> can add, update, suspend bookings only in the assigned properties
-> can add, update payments only in the assigned properties
-> can add, update close tickets only in the assigned properties
-> can add, update notifications only in the assigned properties
-> can add, update ban|suspend customers only in the assigned properties

staff (cheff)
-> login
-> can see the tickets raised by the customer in the property that he is assigned to and have raised for 'cheff'
-> can update the ticket status with reply aginst the ticket that is assigned to him
-> can self assign a ticket that is raised against the property that he is assigned to

staff (janitor)
-> login
-> can see the tickets raised by the customer in the property that he is assigned to and have raised for 'janitor'
-> can update the ticket status with reply aginst the ticket that is assigned to him
-> can self assign a ticket that is raised against the property that he is assigned to

staff (security)
-> login
-> can see the tickets raised by the customer in the property that he is assigned to and have raised for 'security'
-> can update the ticket status with reply aginst the ticket that is assigned to him
-> can self assign a ticket that is raised against the property that he is assigned to

Admin
-> login
-> can add, update, delete properties
-> can add, update, delete rooms
-> can add, update, suspend bookings
-> can add, update payments
-> can add, update close tickets
-> can add, update notifications
-> can add, update ban|suspend customers
-> can add, update ban|suspend users
-> can add, update ban|suspend staff

add soft delete to all the tables
make sure had delete is allowed by the admin only. manager or property manager or staff can not delete any data.
if manager is given permission from the admin settings then he can delete the data too.
